class extends="bxModules.bxai.models.runnables.AiAgent" {

    function init() {
        var apiKey = !isNull( server.system.environment[ "GEMINI_API_KEY" ] ) ? trim( server.system.environment[ "GEMINI_API_KEY" ] ) : "";

        if ( !len( apiKey ) ) {
            throw( type: "MissingGeminiApiKey", message: "GEMINI_API_KEY is required to run this agent. Set it before invoking the agent." );
        }

        super.init(
            name: {{NAME_LITERAL}},
            description: {{DESCRIPTION_LITERAL}},
            model: aiModel(
                provider: {{PROVIDER_LITERAL}},
                apiKey: apiKey,
                params: {
                    model: {{MODEL_LITERAL}}
                },
                options: {
                    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai"
                }
            )
        );
        return this;
    }

    function test() {
        return { model: "mock/mock-model" };
    }
}
