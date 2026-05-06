import { DiagnosisResult, UILanguage } from "../types";
import { GeminiProvider } from "./gemini";
import { GithubModelsProvider } from "./github";
import { DiagnosticProvider } from "./provider";

class DiagnosticRegistry {
  private geminiProvider: GeminiProvider | null = null;
  private githubProvider: GithubModelsProvider | null = null;

  private getGeminiProvider(): GeminiProvider {
    if (!this.geminiProvider) {
      this.geminiProvider = new GeminiProvider();
    }
    return this.geminiProvider;
  }

  private getGithubProvider(): GithubModelsProvider {
    if (!this.githubProvider) {
      this.githubProvider = new GithubModelsProvider();
    }
    return this.githubProvider;
  }

  private isGithubModelAllowed(model: string): boolean {
    const whitelistStr = process.env.GITHUB_MODELS_WHITELIST;
    if (whitelistStr && whitelistStr.trim().length > 0) {
      const whitelist = whitelistStr.split(",").map(m => m.trim().toLowerCase()).filter(m => m.length > 0);
      if (whitelist.length > 0) {
        return whitelist.includes(model.toLowerCase());
      }
    }
    
    const blacklistStr = process.env.GITHUB_MODELS_BLACKLIST;
    if (blacklistStr && blacklistStr.trim().length > 0) {
      const blacklist = blacklistStr.split(",").map(m => m.trim().toLowerCase()).filter(m => m.length > 0);
      if (blacklist.includes(model.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  private isGeminiModelAllowed(model: string): boolean {
    const whitelistStr = process.env.GEMINI_MODELS_WHITELIST;
    if (whitelistStr && whitelistStr.trim().length > 0) {
      const whitelist = whitelistStr.split(",").map(m => m.trim().toLowerCase()).filter(m => m.length > 0);
      if (whitelist.length > 0) {
        return whitelist.includes(model.toLowerCase());
      }
    }
    
    const blacklistStr = process.env.GEMINI_MODELS_BLACKLIST;
    if (blacklistStr && blacklistStr.trim().length > 0) {
      const blacklist = blacklistStr.split(",").map(m => m.trim().toLowerCase()).filter(m => m.length > 0);
      if (blacklist.includes(model.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  async diagnose(text: string, scene: string, lang: UILanguage, model?: string): Promise<DiagnosisResult> {
    const requestedModel = model || process.env.ACTIVE_DIAGNOSTIC_MODEL;
    const isRandom = requestedModel?.toLowerCase() === "random";
    const isRandomGemini = requestedModel?.toLowerCase() === "random-gemini";
    const isRandomGithub = requestedModel?.toLowerCase() === "random-github";
    const isAnyRandom = isRandom || isRandomGemini || isRandomGithub;

    // Track which pool a model came from so routing doesn't rely on model name substrings.
    let providerHint: "gemini" | "github" | null = null;

    let pool: string[] = [];
    if (isRandom) {
      const githubWhitelist = process.env.GITHUB_MODELS_WHITELIST ? process.env.GITHUB_MODELS_WHITELIST.split(",").map(m => m.trim()).filter(m => m.length > 0) : [];
      const geminiWhitelist = process.env.GEMINI_MODELS_WHITELIST ? process.env.GEMINI_MODELS_WHITELIST.split(",").map(m => m.trim()).filter(m => m.length > 0) : [];
      pool = [...githubWhitelist, ...geminiWhitelist];
    } else if (isRandomGemini) {
      pool = process.env.GEMINI_MODELS_WHITELIST ? process.env.GEMINI_MODELS_WHITELIST.split(",").map(m => m.trim()).filter(m => m.length > 0) : [];
      providerHint = "gemini";
    } else if (isRandomGithub) {
      pool = process.env.GITHUB_MODELS_WHITELIST ? process.env.GITHUB_MODELS_WHITELIST.split(",").map(m => m.trim()).filter(m => m.length > 0) : [];
      providerHint = "github";
    }

    // Cap retries at 3 to bound latency.
    const maxAttempts = isAnyRandom ? Math.max(1, Math.min(3, pool.length)) : 1;
    let attempts = 0;
    const attemptedModels: string[] = [];
    let lastError: unknown;

    const geminiPoolSet = isRandom
      ? new Set((process.env.GEMINI_MODELS_WHITELIST || "").split(",").map(m => m.trim().toLowerCase()).filter(m => m.length > 0))
      : null;

    while (attempts < maxAttempts) {
      attempts++;
      let resolvedModelId = requestedModel;

      if (isAnyRandom) {
        const available = pool.filter(m => !attemptedModels.includes(m));
        if (available.length > 0) {
          resolvedModelId = available[Math.floor(Math.random() * available.length)];
        } else if (attempts === 1) {
          resolvedModelId = undefined;
        } else {
          break;
        }
      }

      if (resolvedModelId && isAnyRandom) {
        attemptedModels.push(resolvedModelId);
      }

      let provider: DiagnosticProvider;
      let providerId: "gemini" | "github" = "gemini";

      let effectiveHint = providerHint;
      if (!effectiveHint && isRandom && resolvedModelId && geminiPoolSet) {
        effectiveHint = geminiPoolSet.has(resolvedModelId.toLowerCase()) ? "gemini" : "github";
      }

      // Fallback heuristic: substring match. Fragile — providerHint is preferred.
      const useGemini = effectiveHint === "gemini"
        || (!effectiveHint && (!resolvedModelId || resolvedModelId.toLowerCase().includes("gemini") || resolvedModelId.toLowerCase().includes("gemma")));

      if (useGemini) {
        if (resolvedModelId && !this.isGeminiModelAllowed(resolvedModelId)) {
          if (!isAnyRandom) throw new Error(`Gemini model '${resolvedModelId}' is not allowed by current configuration.`);
          lastError = new Error(`Gemini model '${resolvedModelId}' is not allowed by current configuration.`);
          continue;
        }
        provider = this.getGeminiProvider();
        providerId = "gemini";
      } else {
        if (resolvedModelId && !this.isGithubModelAllowed(resolvedModelId)) {
          if (!isAnyRandom) throw new Error(`Model '${resolvedModelId}' is not allowed by current configuration.`);
          lastError = new Error(`Model '${resolvedModelId}' is not allowed by current configuration.`);
          continue;
        }
        try {
          provider = this.getGithubProvider();
        } catch (err) {
          // GITHUB_TOKEN not set — skip in random mode, rethrow in explicit mode.
          if (!isAnyRandom) throw err;
          console.warn(`[DiagnosticRegistry] GitHub provider unavailable, skipping model '${resolvedModelId}':`, err);
          lastError = err;
          continue;
        }
        providerId = "github";
      }

      try {
        const start = Date.now();
        const result = await provider.diagnose(text, scene, lang, resolvedModelId);

        result._modelId = resolvedModelId || (providerId === "gemini" ? (process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview") : "github-default");
        
        if (attempts > 1) {
          console.log(`[DiagnosticRegistry] Retry successful on attempt ${attempts} with model '${result._modelId}'`);
        }
        console.log(`[DiagnosticRegistry] Provider '${providerId}' completed diagnosis with model '${result._modelId}' in ${Date.now() - start}ms`);
        return result;
      } catch (error) {
        console.error(`[DiagnosticRegistry] Provider '${providerId}' failed with model '${resolvedModelId || 'default'}':`, error);
        lastError = error;
        if (!isAnyRandom) {
          break;
        }
        if (attempts < maxAttempts) {
          console.log(`[DiagnosticRegistry] Upstream issue detected, automatically switching model and retrying...`);
        }
      }
    }

    throw lastError;
  }
}

export const diagnosticRegistry = new DiagnosticRegistry();

// Backward compat alias.
export const diagnose = (text: string, scene: string, lang: UILanguage, model?: string) =>
  diagnosticRegistry.diagnose(text, scene, lang, model);
