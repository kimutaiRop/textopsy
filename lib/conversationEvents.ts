const REFRESH_EVENT = "conversation-list:refresh";

export function emitConversationListRefresh() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
}

export function onConversationListRefresh(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener(REFRESH_EVENT, listener);
  return () => {
    window.removeEventListener(REFRESH_EVENT, listener);
  };
}