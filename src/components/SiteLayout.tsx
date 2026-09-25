import { ReactNode } from 'react'
import { Box, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { Link, useLocation } from '@tanstack/react-router'
import Header from './header/Header'
import Footer from './footer/Footer'
import Logo from './Logo'
import MobileExperienceNotice from './MobileExperienceNotice'

const informationLinks = [
  { to: '/contact', label: 'Contact us' },
  { to: '/about', label: 'About ROBOKOP' },
  { to: '/guide', label: 'User guide' },
  { to: '/tutorial', label: 'Tutorial' },
  { to: '/events', label: 'Events' },
  { to: '/releases', label: 'Releases' },
  { to: '/citations', label: 'Citations' },
  { to: '/funding', label: 'Funding' },
  { to: '/license', label: 'License' },
  { to: '/termsofservice', label: 'Terms of Service' },
] as const

export default function SiteLayout({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const pathname = useLocation({ select: (location) => location.pathname }).replace(/\/$/, '')
  const isInformationPage = informationLinks.some(({ to }) => to === pathname)
  // Allow account activation and sign-in callbacks to finish on any screen size.
  const isAccountCallback = pathname === '/activate-user' || pathname === '/oauth-callback'

  if (!isMobile) {
    return (
      <>
        <Header />
        <div id='contentContainer'>{children}</div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Box component='header' sx={{ p: 2, bgcolor: '#f5f7fa', borderBottom: '1px solid #e2e8f0' }}>
        <Link to='/' aria-label='ROBOKOP home'>
          <Logo width='180px' height='32px' />
        </Link>
      </Box>
      <Box
        component='main'
        sx={{
          flex: 1,
          minWidth: 0,
          p: 2,
          overflowWrap: 'anywhere',
          '& img, & video, & iframe': { maxWidth: '100%' },
          '& input, & textarea': { boxSizing: 'border-box', maxWidth: '100%' },
          '& a:focus-visible, & button:focus-visible': {
            outline: '2px solid #4b63d4',
            outlineOffset: 3,
          },
        }}
      >
        {isInformationPage || isAccountCallback ? children : <MobileExperienceNotice />}
        <Box
          component='nav'
          aria-label='Important links'
          sx={{ mt: 4, pt: 2.5, borderTop: '1px solid #e2e8f0' }}
        >
          <Typography
            component='h2'
            variant='overline'
            sx={{
              display: 'block',
              mb: 1.5,
              color: '#64748b',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            Important links
          </Typography>
          <Box
            component='ul'
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              '& li + li': { borderTop: '1px solid #edf0f5' },
              '& a': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                minHeight: 48,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                color: '#334155',
                fontSize: '0.95rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'background-color 150ms ease, color 150ms ease',
                '& svg': { color: '#94a3b8', fontSize: 19, flexShrink: 0 },
              },
              '& a:hover, & a:focus-visible': {
                bgcolor: '#f5f7ff',
                color: '#4b63d4',
                textDecoration: 'none',
                '& svg': { color: '#4b63d4' },
              },
              '& a[aria-current="page"]': {
                bgcolor: '#eef2ff',
                color: '#4054b8',
                fontWeight: 700,
                boxShadow: 'inset 3px 0 0 #627dff',
                '& svg': { color: '#4054b8' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                '& a': { transition: 'none' },
              },
            }}
          >
            {informationLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} aria-current={pathname === to ? 'page' : undefined}>
                  {label}
                  <ChevronRightRoundedIcon aria-hidden='true' />
                </Link>
              </li>
            ))}
          </Box>
        </Box>
      </Box>
      <Box sx={{ '& footer': { p: 2, overflowWrap: 'anywhere' } }}>
        <Footer />
      </Box>
    </>
  )
}
