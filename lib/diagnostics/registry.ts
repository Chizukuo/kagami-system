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
    if (whitelistStr) {
      const whitelist = whitelistStr.split(",").map(m => m.trim().toLowerCase());
      return whitelist.includes(model.toLowerCase());
    }
    
    const blacklistStr = process.env.GITHUB_MODELS_BLACKLIST;
    if (blacklistStr) {
      const blacklist = blacklistStr.split(",").map(m => m.trim().toLowerCase());
      if (blacklist.includes(model.toLowerCase())) {
        return false;
      }
    }
    
    // Default allow if no strict lists are defined
    return true;
  }

  async diagnose(text: string, scene: string, lang: UILanguage, model?: string): Promise<DiagnosisResult> {
    let resolvedModelId = model || process.env.ACTIVE_DIAGNOSTIC_MODEL;
    
    // Automatically select a random model from the whitelist if set to 'random'
    if (resolvedModelId?.toLowerCase() === "random") {
      const whitelistStr = process.env.GITHUB_MODELS_WHITELIST;
      if (whitelistStr) {
        const pool = whitelistStr.split(",").map(m => m.trim()).filter(m => m.length > 0);
        if (pool.length > 0) {
          resolvedModelId = pool[Math.floor(Math.random() * pool.length)];
        } else {
          resolvedModelId = "gemini";
        }
      } else {
        resolvedModelId = "gemini";
      }
    }
    
    // Determine provider logic
    let provider: DiagnosticProvider;
    let providerId: "gemini" | "github" = "gemini";

    // Standard Gemini detection
    if (!resolvedModelId || resolvedModelId.toLowerCase().includes("gemini")) {
      provider = this.getGeminiProvider();
      providerId = "gemini";
    } else {
      // Anything else is assumed to be a GitHub model (GPT, Llama, Mistral, etc.)
      if (!this.isGithubModelAllowed(resolvedModelId)) {
         throw new Error(`Model '${resolvedModelId}' is not allowed by current configuration.`);
      }
      provider = this.getGithubProvider();
      providerId = "github";
    }

    try {
      const start = Date.now();
      const result = await provider.diagnose(text, scene, lang, resolvedModelId);
      
      // Inject model identifier for telemetry mapping
      result._modelId = resolvedModelId || (providerId === "gemini" ? (process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview") : "github-default");
      
      console.log(`[DiagnosticRegistry] Provider '${providerId}' completed diagnosis with model '${result._modelId}' in ${Date.now() - start}ms`);
      return result;
    } catch (error) {
      console.error(`[DiagnosticRegistry] Provider '${providerId}' failed:`, error);
      throw error;
    }
  }
}

export const diagnosticRegistry = new DiagnosticRegistry();

// Keep backward compatibility for existing imports in case any remain
export const diagnose = (text: string, scene: string, lang: UILanguage, model?: string) => 
  diagnosticRegistry.diagnose(text, scene, lang, model);
