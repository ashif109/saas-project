'use server';
/**
 * @fileOverview Provides an AI-powered tool to generate suggested responses for student doubts in the chat interface.
 *
 * - suggestDoubtResponses - A function that generates AI-suggested responses to a student's doubt.
 * - AIDoubtResponseInput - The input type for the suggestDoubtResponses function.
 * - AIDoubtResponseOutput - The return type for the suggestDoubtResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIDoubtResponseInputSchema = z.object({
  doubtQuery: z.string().describe("The student's current doubt or question."),
  chatHistory: z
    .array(
      z.object({
        sender: z.enum(['student', 'faculty']).describe('The sender of the message.'),
        text: z.string().describe('The content of the message.'),
      })
    )
    .optional()
    .describe('Optional: A history of previous messages in the conversation.'),
});
export type AIDoubtResponseInput = z.infer<typeof AIDoubtResponseInputSchema>;

const AIDoubtResponseOutputSchema = z.object({
  suggestedResponses: z
    .array(z.string())
    .describe('A list of concise and relevant suggested responses.'),
});
export type AIDoubtResponseOutput = z.infer<typeof AIDoubtResponseOutputSchema>;

export async function suggestDoubtResponses(
  input: AIDoubtResponseInput
): Promise<AIDoubtResponseOutput> {
  return aiDoubtResponseSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'doubtResponseSuggestionPrompt',
  input: {schema: AIDoubtResponseInputSchema},
  output: {schema: AIDoubtResponseOutputSchema},
  prompt: `You are an AI assistant for a college administration system, specialized in helping faculty respond to student doubts.
Your goal is to provide concise, relevant, and helpful suggested responses to student queries.
Consider the chat history, if provided, to understand the context.
Generate 2-3 distinct suggestions that a faculty member could use or adapt.

Chat History:
{{#if chatHistory}}
{{#each chatHistory}}
  {{this.sender}}: {{{this.text}}}
{{/each}}
{{else}}
  No previous chat history.
{{/if}}

Student's Doubt: {{{doubtQuery}}}

Suggested Responses:`,
});

const aiDoubtResponseSuggestionFlow = ai.defineFlow(
  {
    name: 'aiDoubtResponseSuggestionFlow',
    inputSchema: AIDoubtResponseInputSchema,
    outputSchema: AIDoubtResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
