class PromptTemplate:
    """
    Template wrapper for standardizing prompt construction.
    """

    def __init__(self, template: str) -> None:
        self.template = template

    def render(self, **kwargs: str) -> str:
        return self.template.format(**kwargs)


class DefaultSystemTemplate:
    DEFAULT_SYSTEM_PROMPT: str = (
        "You are CortexAI, an enterprise intelligent assistant designed to"
        " assist users with precision, accuracy, and clear structured"
        " reasoning."
    )

    @classmethod
    def get_system_prompt(cls, custom_prompt: str | None = None) -> str:
        if custom_prompt and custom_prompt.strip():
            return custom_prompt.strip()
        return cls.DEFAULT_SYSTEM_PROMPT
