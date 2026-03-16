import React from "react";
import { Box, Button, Card, CardContent, Chip, Divider, Link, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GitHubRelease } from "./functions";

interface ReleaseNoteCardProps {
  releaseNote: GitHubRelease;
  onEdit?: (release: GitHubRelease) => void;
  onDelete?: (release: GitHubRelease) => void;
}

function ReleaseNoteCard({ releaseNote, onEdit, onDelete }: ReleaseNoteCardProps) {
  const publishedDate = releaseNote.publishedAt
    ? new Date(releaseNote.publishedAt).toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1, alignItems: "center" }}>
          <Typography variant="h5" sx={{ mr: "auto" }}>
            {releaseNote.name}
          </Typography>
          <Chip size="small" label={releaseNote.tagName} />
          {releaseNote.prerelease ? <Chip size="small" color="warning" label="Pre-release" /> : null}
        </Stack>

        {publishedDate ? (
          <Typography variant="body2" color="text.secondary">
            Published {publishedDate}
          </Typography>
        ) : null}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2, alignItems: "center" }}>
          {releaseNote.htmlUrl && (
            <Link href={releaseNote.htmlUrl} target="_blank" rel="noreferrer noopener">
              View on GitHub
            </Link>
          )}
          {releaseNote.tarballUrl && (
            <Link href={releaseNote.tarballUrl} target="_blank" rel="noreferrer noopener">
              Tarball
            </Link>
          )}
          {releaseNote.zipballUrl && (
            <Link href={releaseNote.zipballUrl} target="_blank" rel="noreferrer noopener">
              Zipball
            </Link>
          )}

          {(onEdit || onDelete) && <Box sx={{ flexGrow: 1 }} />}
          {onEdit && (
            <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(releaseNote)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(releaseNote)}>
              Delete
            </Button>
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Release Notes
        </Typography>
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            backgroundColor: "background.default",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              "& p": { mt: 0, mb: 1.5 },
              "& h1, & h2, & h3, & h4": { mt: 0, mb: 1.5 },
              "& ul, & ol": { mt: 0, mb: 1.5, pl: 3 },
              "& li": { mb: 0.5 },
              "& a": { color: "primary.main" },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{releaseNote.body}</ReactMarkdown>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ReleaseNoteCard;
