import React from 'react'
import { FooterLinkGroup } from '../../data/footer'

interface FooterLinksProps {
  groups: FooterLinkGroup[]
}

export const FooterLinks: React.FC<FooterLinksProps> = ({ groups }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
      {groups.map((group, idx) => (
        <div key={idx}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
            {group.title}
          </h4>
          <ul className="space-y-2.5">
            {group.links.map((link, linkIdx) => (
              <li key={linkIdx}>
                <a
                  href={link.href}
                  className="text-xs sm:text-sm text-slate-600 hover:text-indigo-600 transition-colors inline-block"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
