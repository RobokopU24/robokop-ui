import { Container, Skeleton, Stack, Typography } from "@mui/material";

import { getReleaseNotes } from "./functions";
import { useQuery } from "@tanstack/react-query";
import ReleaseNoteCard from "./ReleaseNoteCard";

function Releases() {
  const { data: releaseNotes, isLoading: isLoadingReleases } = useQuery({
    queryKey: ["release-notes"],
    queryFn: () => getReleaseNotes(),
  });

  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      <Typography variant="h4" gutterBottom>
        Releases
      </Typography>
      {isLoadingReleases ? (
        Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} variant="rounded" height={302} />)
      ) : releaseNotes && releaseNotes.length > 0 ? (
        <Stack spacing={4}>
          {releaseNotes.map((releaseNote) => (
            <ReleaseNoteCard key={releaseNote.id} releaseNote={releaseNote} />
          ))}
        </Stack>
      ) : (
        <Typography>No release notes available.</Typography>
      )}
    </Container>
  );
}

export default Releases;
