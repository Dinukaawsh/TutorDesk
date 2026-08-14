"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AssignmentTarget } from "@prisma/client";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubjectOption = { id: string; name: string };
type StudentOption = { id: string; name: string; grade: string | null };

type AssignmentFormProps = {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  subjects: SubjectOption[];
  students: StudentOption[];
};

const initialState: ActionResult = { success: false };

export function AssignmentForm({ action, subjects, students }: AssignmentFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [targetType, setTargetType] = useState<AssignmentTarget>(AssignmentTarget.GRADE);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [individualStudentId, setIndividualStudentId] = useState(students[0]?.id ?? "");

  return (
    <form action={formAction} encType="multipart/form-data" className="mx-auto max-w-2xl space-y-4">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="subjectId" value={subjectId} />
      {targetType === AssignmentTarget.INDIVIDUAL ? (
        <input type="hidden" name="individualStudentId" value={individualStudentId} />
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea id="instructions" name="instructions" rows={4} />
      </div>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Target</Label>
        <Select
          value={targetType}
          onValueChange={(value) => setTargetType(value as AssignmentTarget)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AssignmentTarget.GRADE}>Whole grade</SelectItem>
            <SelectItem value={AssignmentTarget.INDIVIDUAL}>Individual student</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {targetType === AssignmentTarget.GRADE ? (
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input id="grade" name="grade" placeholder="e.g. 10" />
          {state.fieldErrors?.grade?.[0] ? (
            <p className="text-sm text-muted-foreground">{state.fieldErrors.grade[0]}</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Student</Label>
          <Select value={individualStudentId} onValueChange={setIndividualStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                  {student.grade ? ` (Grade ${student.grade})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors?.individualStudentId?.[0] ? (
            <p className="text-sm text-muted-foreground">{state.fieldErrors.individualStudentId[0]}</p>
          ) : null}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input id="deadline" name="deadline" type="datetime-local" required />
        {state.fieldErrors?.deadline?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.deadline[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="attachment">Attachment (optional)</Label>
        <Input id="attachment" name="attachment" type="file" accept="application/pdf,image/*" />
      </div>
      {state.message ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">{state.message}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create assignment"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/teacher/assignments">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
