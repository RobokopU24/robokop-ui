import React from 'react'
import { Link } from '@tanstack/react-router'
import './footer.css'

const version = import.meta.env.VITE_APP_VERSION
const buildDate = import.meta.env.VITE_BUILD_DATE

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
      {(version || buildDate) && (
        <p className='footer-version'>
          {version && <>v{version}</>}
          {version && buildDate && ' | '}
          {buildDate && <>Deployed: {buildDate}</>}
        </p>
      )}
    </footer>
  )
}
