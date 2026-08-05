from pydantic import BaseModel, Field

from app.ai.prompts.templates import DefaultSystemTemplate
from app.ai.schemas import ChatMessage


class PromptBuildResult(BaseModel):
    """
    Result of PromptBuilder. Contains formatted messages ready for provider
    consumption.
    """

    system_prompt: str
    user_prompt: str
    messages: list[dict[str, str]] = Field(default_factory=list)
    raw_prompt: str


class PromptBuilder:
    """
    Constructs prompts independently of LLM provider implementations.
    Assembles system prompt, user prompt, and conversation history.
    """

    def __init__(self) -> None:
        self._system_prompt: str | None = None
        self._user_prompt: str = ""
        self._history: list[ChatMessage] = []

    def set_system_prompt(self, system_prompt: str | None) -> "PromptBuilder":
        self._system_prompt = system_prompt
        return self

    def set_user_prompt(self, user_prompt: str) -> "PromptBuilder":
        self._user_prompt = user_prompt.strip()
        return self

    def set_history(self, history: list[ChatMessage] | None) -> "PromptBuilder":
        if history:
            self._history = history
        return self

    def build(self) -> PromptBuildResult:
        resolved_system = DefaultSystemTemplate.get_system_prompt(self._system_prompt)

        messages: list[dict[str, str]] = []
        messages.append({"role": "system", "content": resolved_system})

        for msg in self._history:
            messages.append({"role": msg.role, "content": msg.content})

        messages.append({"role": "user", "content": self._user_prompt})

        # Format raw prompt text representation
        raw_parts = [f"System: {resolved_system}"]
        for msg in self._history:
            raw_parts.append(f"{msg.role.capitalize()}: {msg.content}")
        raw_parts.append(f"User: {self._user_prompt}")
        raw_prompt = "\n\n".join(raw_parts)

        return PromptBuildResult(
            system_prompt=resolved_system,
            user_prompt=self._user_prompt,
            messages=messages,
            raw_prompt=raw_prompt,
        )
