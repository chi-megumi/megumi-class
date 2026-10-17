import React from 'react'
import Link from 'next/link'
import { FOOTER_LINKS } from '../../data/footer'
import { FooterLinks } from './FooterLinks'
import { ArrowUp, Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/80 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-200/70">
          {/* Brand Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                  <span className="text-xl">🌸</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                      Megumi
                    </span>
                    <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded-sm bg-pink-100 text-pink-700 tracking-wider">
                      Class
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase">
                    Lớp học Cô Chi • Anh — Trung
                  </span>
                </div>
              </Link>

              <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                Trung tâm đào tạo & phản xạ Song ngữ Tiếng Anh — Tiếng Trung chuyên sâu cho học sinh, sinh viên và người đi làm. Lộ trình cá nhân hóa cùng Cô Đoàn Quỳnh Chi.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Được xây dựng với</span>
              <Heart size={14} className="text-rose-500 fill-rose-500" />
              <span>dành cho cộng đồng học viên Megumi</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7">
            <FooterLinks groups={FOOTER_LINKS} />
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 Megumi Class. All rights reserved. Lớp học Cô Chi (Đoàn Quỳnh Chi).
          </div>

          <a
            href="#hero"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-xs"
          >
            <span>Về đầu trang</span>
            <ArrowUp size={13} />
          </a>
        </div>
      </div>
    </footer>
  )
}
