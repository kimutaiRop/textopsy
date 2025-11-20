'use client';

import { useEffect, useState } from "react";
import { MESSAGE_PERSPECTIVE_DEFAULT, type MessagePerspectiveCopy } from "@/lib/contextOptions";

export function useMessagePerspectiveCopy() {
  const [copy, setCopy] = useState<MessagePerspectiveCopy>(MESSAGE_PERSPECTIVE_DEFAULT);

  useEffect(() => {
    let aborted = false;

    const fetchCopy = async () => {
      try {
        const response = await fetch("/api/settings/message-perspective");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (aborted) return;
        setCopy({
          title: data.title || MESSAGE_PERSPECTIVE_DEFAULT.title,
          description: data.description || MESSAGE_PERSPECTIVE_DEFAULT.description,
        });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Failed to load message perspective copy:", error);
        }
      }
    };

    fetchCopy();

    return () => {
      aborted = true;
    };
  }, []);

  return copy;
}

