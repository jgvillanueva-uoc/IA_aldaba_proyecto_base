/**
 * Integrates with the external Gemini API to estimate ICE values from text.
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { configuration } from '../../../config/configuration';
import type { AiEstimationResponseDto } from '../dto/ai-estimation-response.dto';

interface GeminiResponsePart {
  readonly text?: string;
}

interface GeminiResponseContent {
  readonly parts?: readonly GeminiResponsePart[];
}

interface GeminiResponseCandidate {
  readonly content?: GeminiResponseContent;
}

interface GeminiGenerateContentResponse {
  readonly candidates?: readonly GeminiResponseCandidate[];
}

@Injectable()
export class GeminiProvider {
  /**
   * Requests an ICE estimation from Gemini using the task description.
   * @param description Task description used to build the remote prompt.
   * @returns Parsed ICE estimation payload with integer values.
   */
  public async estimateIce(
    description: string,
  ): Promise<AiEstimationResponseDto> {
    const aiConfig = configuration().ai;

    if (aiConfig.geminiApiKey === undefined) {
      throw new DomainException(
        'Gemini API key is not configured',
        ERROR_CODES.AI_UNAVAILABLE,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, aiConfig.timeoutMs);

    try {
      const response = await fetch(
        this.buildEndpoint(aiConfig.geminiModel, aiConfig.geminiApiKey),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: this.buildPrompt(description),
                  },
                ],
              },
            ],
          }),
          signal: abortController.signal,
        },
      );

      if (!response.ok) {
        throw this.createAiUnavailableError(
          `Gemini request failed with status ${response.status}`,
        );
      }

      const responseBody =
        (await response.json()) as GeminiGenerateContentResponse;
      const responseText = this.extractResponseText(responseBody);

      return this.parseEstimation(responseText);
    } catch (error: unknown) {
      if (error instanceof DomainException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createAiUnavailableError('Gemini request timed out');
      }

      throw this.createAiUnavailableError('Timeout or invalid AI payload');
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  /**
   * Returns provider readiness during bootstrap phase.
   * @returns Provider status text.
   */
  public getStatus(): string {
    return 'Gemini provider ready';
  }

  /**
   * Builds the Gemini generateContent endpoint for the configured model.
   * @param model Gemini model identifier.
   * @param apiKey Gemini API key used for authentication.
   * @returns Fully-qualified HTTPS endpoint.
   */
  private buildEndpoint(model: string, apiKey: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  }

  /**
   * Builds a strict JSON-only prompt for Gemini.
   * @param description Task description provided by the caller.
   * @returns Prompt text sent to the external provider.
   */
  private buildPrompt(description: string): string {
    return [
      'Estimate ICE values for the task description below.',
      'Respond with valid JSON only, without markdown fences or extra text.',
      'Use this exact shape: {"impact":number,"confidence":number,"effort":number}.',
      'All values must be integers between 1 and 10.',
      `Task description: ${description}`,
    ].join('\n');
  }

  /**
   * Extracts the first text part returned by Gemini.
   * @param responseBody Raw JSON payload from the Gemini API.
   * @returns Plain text content expected to contain a JSON object.
   */
  private extractResponseText(
    responseBody: GeminiGenerateContentResponse,
  ): string {
    const candidate = responseBody.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (typeof part?.text !== 'string' || part.text.trim().length === 0) {
      throw this.createAiUnavailableError('Invalid AI payload: missing text');
    }

    return part.text.trim();
  }

  /**
   * Parses the provider text response into a normalized ICE estimation.
   * @param responseText Text returned by the provider.
   * @returns ICE estimation with integer fields.
   */
  private parseEstimation(responseText: string): AiEstimationResponseDto {
    const sanitizedText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(sanitizedText) as Record<string, unknown>;

      return this.validateEstimationShape(parsed);
    } catch {
      throw this.createAiUnavailableError('Invalid AI payload: malformed JSON');
    }
  }

  /**
   * Validates the parsed JSON shape returned by the provider.
   * @param parsed Raw parsed JSON object.
   * @returns Estimation payload with numeric ICE fields.
   */
  private validateEstimationShape(
    parsed: Record<string, unknown>,
  ): AiEstimationResponseDto {
    const impact = parsed.impact;
    const confidence = parsed.confidence;
    const effort = parsed.effort;

    if (
      !Number.isInteger(impact) ||
      !Number.isInteger(confidence) ||
      !Number.isInteger(effort)
    ) {
      throw this.createAiUnavailableError(
        'Invalid AI payload: expected integer ICE fields',
      );
    }

    return {
      impact: Number(impact),
      confidence: Number(confidence),
      effort: Number(effort),
    };
  }

  /**
   * Creates the standardized domain error for external AI failures.
   * @param message Human-readable failure detail.
   * @returns Domain exception mapped later to HTTP 502.
   */
  private createAiUnavailableError(message: string): DomainException {
    return new DomainException(
      message,
      ERROR_CODES.AI_UNAVAILABLE,
      HttpStatus.BAD_GATEWAY,
    );
  }
}
