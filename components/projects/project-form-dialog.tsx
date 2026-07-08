"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject, type ProjectFormInput } from "@/lib/actions/projects";
import { useRouter } from "@/i18n/navigation";

export function ProjectFormDialog() {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormInput>();

  async function onSubmit(values: ProjectFormInput) {
    setSubmitting(true);
    const result = await createProject(values);
    setSubmitting(false);
    if (!result.error) {
      reset();
      setOpen(false);
      if (result.data?.id) router.push(`/projects/${result.data.id}`);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          {t("projects.newProject")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("projects.newProject")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("projects.name")}</Label>
            <Input
              id="name"
              placeholder={t("projects.namePlaceholder")}
              {...register("name", { required: true })}
            />
            {errors.name && (
              <span className="text-xs text-danger">{t("common.required")}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">{t("projects.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("projects.descriptionPlaceholder")}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal">{t("projects.goal")}</Label>
              <Input id="goal" {...register("goal")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deadline">{t("projects.deadline")}</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">{t("projects.website")}</Label>
            <Input id="website" placeholder="https://" {...register("website")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("common.saving") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
