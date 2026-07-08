import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProjectFiles } from "@/lib/data/files";
import { FileList } from "@/components/files/file-list";
import { FileUploadButton } from "@/components/files/file-upload-button";

export default async function ProjectFilesPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const [t, files] = await Promise.all([getTranslations("projects"), getProjectFiles(projectId)]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t("filesGallery")}
        </h2>
        <FileUploadButton scope="project" scopeId={projectId} />
      </div>
      <FileList files={files} />
    </div>
  );
}
