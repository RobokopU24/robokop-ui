import React from 'react'
import { Link } from '@tanstack/react-router'
import { formatBuildDate } from '../../utils/dateTime'
import './footer.css'

const rawVersion = import.meta.env.VITE_APP_VERSION as string | undefined
const version = rawVersion?.replace(/^v/i, '')
const buildDate = import.meta.env.VITE_BUILD_DATE as string | undefined
const formattedBuildDate = buildDate ? formatBuildDate(buildDate) : undefined

export default function Footer() {
  return (
    <footer>
      <p>
        ROBOKOP is a joint creation of{' '}
        <a href='http://www.renci.org' target='_blank' rel='noreferrer'>
          RENCI
        </a>{' '}
        and{' '}
        <a href='http://www.covar.com' target='_blank' rel='noreferrer'>
          CoVar LLC
        </a>
        . Early development was supported by{' '}
        <a href='https://ncats.nih.gov' target='_blank' rel='noreferrer'>
          NCATS
        </a>
        ; continued development is supported by{' '}
        <a href='https://niehs.nih.gov' target='_blank' rel='noreferrer'>
          NIEHS
        </a>{' '}
        and the{' '}
        <a href='https://www.nih.gov/' target='_blank' rel='noreferrer'>
          NIH
        </a>{' '}
        <a href='https://datascience.nih.gov/about/odss' target='_blank' rel='noreferrer'>
          ODSS
        </a>
        . <Link to='/termsofservice'>Terms of Service</Link>.
      </p>
      {(version || formattedBuildDate) && (
        <p className='footer-version'>
          {version && <>v{version}</>}
          {version && formattedBuildDate && ' | '}
          {formattedBuildDate && <>Deployed: {formattedBuildDate}</>}
        </p>
      )}
    </footer>
  )
}
