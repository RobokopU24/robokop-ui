import { Box, Paper, Typography } from '@mui/material'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'

export default function MobileExperienceNotice() {
  return (
    <Paper
      component='section'
      aria-labelledby='mobile-experience-title'
      variant='outlined'
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: '#dce2ff',
        bgcolor: '#f5f7ff',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <DesktopWindowsOutlinedIcon sx={{ color: '#4b63d4', flexShrink: 0 }} />
        <Typography id='mobile-experience-title' component='h1' variant='h6' fontWeight={600}>
          Best experienced on desktop
        </Typography>
      </Box>
      <Typography variant='body2' sx={{ lineHeight: 1.6 }}>
        For the best experience building queries and exploring knowledge graphs, please use ROBOKOP
        on a desktop or laptop. You can still learn about ROBOKOP, read our guide, and contact us
        from your phone.
      </Typography>
    </Paper>
  )
}
