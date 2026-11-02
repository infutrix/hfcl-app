import { useState } from "react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FIBER_TYPE_GROUPS, isKnownFiberType } from "@/lib/fiber-types"

const OTHER = "__other__"

/**
 * Fiber type picker: the standard list, or "Other" to type one in. A typed value is committed on
 * blur / Enter (not per keystroke), because every change re-links the testing session.
 */
export function FiberTypeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [pickedOther, setPickedOther] = useState(false)
  // null = not editing; the box then shows the current (manual) value.
  const [draft, setDraft] = useState<string | null>(null)
  const manual = pickedOther || (value !== "" && !isKnownFiberType(value))

  function commit() {
    if (draft === null) return
    const next = draft.trim()
    setDraft(null)
    if (next !== value) onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={manual ? OTHER : value}
        onValueChange={(next) => {
          setPickedOther(next === OTHER)
          setDraft(next === OTHER ? "" : null)
          onChange(next === OTHER ? "" : next)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Fiber Type" />
        </SelectTrigger>
        <SelectContent>
          {FIBER_TYPE_GROUPS.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          <SelectSeparator />
          <SelectItem value={OTHER}>Other (type manually)</SelectItem>
        </SelectContent>
      </Select>
      {manual && (
        <Input
          autoFocus={pickedOther}
          placeholder="Type fiber type and press Enter"
          value={draft ?? value}
          maxLength={100}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
        />
      )}
    </div>
  )
}
