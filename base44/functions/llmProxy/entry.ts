import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        const { prompt, model, response_json_schema, file_urls, add_context_from_internet } = body;

        if (!prompt) {
            return Response.json({ error: 'prompt is required' }, { status: 400 });
        }

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            model: model || 'automatic',
            response_json_schema: response_json_schema || null,
            file_urls: file_urls || null,
            add_context_from_internet: add_context_from_internet || false,
        });

        return Response.json({ success: true, result });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});