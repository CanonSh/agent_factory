class extends="bxModules.bxai.models.runnables.AiAgent" {

    function init() {
        super.init(
            name: {{NAME_LITERAL}},
            description: {{DESCRIPTION_LITERAL}},
            model: aiModel(
                provider: {{PROVIDER_LITERAL}},
                apiKey: getSystemSetting( "GEMINI_API_KEY", "" ),
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
