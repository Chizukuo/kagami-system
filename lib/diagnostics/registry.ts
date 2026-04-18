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
    
    // Default allow if no strict lists are defined
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
    
    // Default allow if no strict lists are defined
    return true;
  }

  async diagnose(text: string, scene: string, lang: UILanguage, model?: string): Promise<DiagnosisResult> {
    const requestedModel = model || process.env.ACTIVE_DIAGNOSTIC_MODEL;
    const isRandom = requestedModel?.toLowerCase() === "random";
    const isRandomGemini = requestedModel?.toLowerCase() === "random-gemini";
    const isRandomGithub = requestedModel?.toLowerCase() === "random-github";
    const isAnyRandom = isRandom || isRandomGemini || isRandomGithub;

    let pool: string[] = [];
    if (isRandom) {
      const githubWhitelist = process.env.GITHUB_MODELS_WHITELIST ? process.env.GITHUB_MODELS_WHITELIST.split(",").map(m => m.trim()).filter(m => m.length > 0) : [];
      const geminiWhitelist = process.env.GEMINI_MODELS_WHITELIST ? process.env.GEMINI_MODELS_WHITELIST.split(",").map(m => m.trim()).filter(m => m.length > 0) : [];
      pool = [...githubWhitelist, ...geminiWhitelist];
    } else if (isRandomGemini) {
      pool = process.env.GEMINI_MODELS_WHITELIST ? process.env.GEMINI_MODELS_WHITELIST.split(",").map(m => m.trim()).filter(m => m.length > 0) : [];
    } else if (isRandomGithub) {
      pool = process.env.GITHUB_MODELS_WHITELIST ? process.env.GITHUB_MODELS_WHITELIST.split(",").map(m => m.trim()).filter(m => m.length > 0) : [];
    }

    // Limit retries to 3 times or the total available models in the pool, whichever is smaller. At least 1 attempt.
    const maxAttempts = isAnyRandom ? Math.max(1, Math.min(3, pool.length)) : 1;
    let attempts = 0;
    const attemptedModels: string[] = [];
    let lastError: any;

    while (attempts < maxAttempts) {
      attempts++;
      let resolvedModelId = requestedModel;

      if (isAnyRandom) {
        const available = pool.filter(m => !attemptedModels.includes(m));
        if (available.length > 0) {
          resolvedModelId = available[Math.floor(Math.random() * available.length)];
        } else if (attempts === 1) {
          // If pool is empty, let it fall through to default behavior, but only once
          resolvedModelId = undefined;
        } else {
          break; // No more models to try
        }
      }

      if (resolvedModelId && isAnyRandom) {
        attemptedModels.push(resolvedModelId);
      }

      // Determine provider logic
      let provider: DiagnosticProvider;
      let providerId: "gemini" | "github" = "gemini";

      // Standard Gemini detection
      if (!resolvedModelId || resolvedModelId.toLowerCase().includes("gemini")) {
        if (resolvedModelId && !this.isGeminiModelAllowed(resolvedModelId)) {
          if (!isAnyRandom) throw new Error(`Gemini model '${resolvedModelId}' is not allowed by current configuration.`);
          lastError = new Error(`Gemini model '${resolvedModelId}' is not allowed by current configuration.`);
          continue;
        }
        provider = this.getGeminiProvider();
        providerId = "gemini";
      } else {
        // Anything else is assumed to be a GitHub model (GPT, Llama, Mistral, etc.)
        if (!this.isGithubModelAllowed(resolvedModelId)) {
          if (!isAnyRandom) throw new Error(`Model '${resolvedModelId}' is not allowed by current configuration.`);
          lastError = new Error(`Model '${resolvedModelId}' is not allowed by current configuration.`);
          continue;
        }
        provider = this.getGithubProvider();
        providerId = "github";
      }

      try {
        const start = Date.now();
        const result = await provider.diagnose(text, scene, lang, resolvedModelId);
        
        // Inject model identifier for telemetry mapping
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
          break; // Do not retry if not in random mode
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

// Keep backward compatibility for existing imports in case any remain
export const diagnose = (text: string, scene: string, lang: UILanguage, model?: string) => 
  diagnosticRegistry.diagnose(text, scene, lang, model);
