"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Down from "@/assets/svgs/down.svg";
import type { Category } from "@/lib/types";

type CategorySelectProps = {
  categories: Category[];
  value: number;
  onChange: (categoryId: number) => void;
  disabled?: boolean;
};

export function CategorySelect({ categories, value, onChange, disabled }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    categories.findIndex((item) => item.id === value)
  );
  const selectedCategory = categories[selectedIndex];

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  function openMenu() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function select(index: number) {
    const nextCategory = categories[index];
    if (nextCategory) onChange(nextCategory.id);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => (current + direction + categories.length) % categories.length);
      return;
    }
    if (open && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      select(activeIndex);
    }
  }

  return (
    <div ref={rootRef} className="relative z-20 w-[255px] shrink-0 max-sm:w-[190px]">
      <button
        type="button"
        className="flex h-10 w-full items-center gap-3 rounded-[11px] border border-line bg-paper px-4 text-left text-[16px] outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Category"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: selectedCategory?.color }}
        />
        <span className="min-w-0 flex-1 truncate">
          {selectedCategory?.name ?? "Select category"}
        </span>
        <Down className={`h-6 w-6 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+7px)] w-full overflow-hidden rounded-[8px] bg-paper py-2 shadow-[0_10px_24px_rgba(87,54,26,0.12)]">
          <div
            role="listbox"
            aria-label="Categories"
            aria-activedescendant={`category-option-${categories[activeIndex]?.id}`}
          >
            {categories.map((item, index) => (
              <button
                key={item.id}
                id={`category-option-${item.id}`}
                type="button"
                role="option"
                aria-selected={item.id === value}
                className={`flex h-10 w-full items-center gap-3 px-4 text-left text-[16px] outline-none hover:bg-line/10 ${index === activeIndex ? "bg-line/10" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(index)}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
