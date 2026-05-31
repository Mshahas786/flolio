"use client"

import { PublicProfile } from "@/components/public-page/public-profile"
import type { LinkData, SocialLinkData, ProductData, EmbedData, PageData, IntegrationData } from "@/components/public-page/public-profile"

interface ProfilePreviewProps {
  name: string
  bio?: string
  avatarUrl?: string
  username: string
  isPro: boolean
  accentColor: string
  theme: string
  showBranding: boolean
  buttonStyle: string
  bioAlignment: string
  buttonTextColor: string
  backgroundColor: string
  avatarShape: string
  fontFamily: string
  fontSize: string
  linkBorderWidth: string
  linkShadow: string
  linkSpacing: string
  layoutMode: string
  hoverEffect: string
  showAvatar: boolean
  showBio: boolean
  headerImageUrl: string
  customCss: string
  isLocked: boolean
  pagePassword: string
  buttonBorderColor: string
  buttonFontWeight: string
  countdownTitle: string
  countdownDate: string
  enableEmailCapture: boolean
  emailCaptureTitle: string
  metaTitle: string
  metaDescription: string
  ogImageUrl: string
  tipEnabled: boolean
  tipVenmo: string
  tipPayPal: string
  tipCashApp: string
  links: LinkData[]
  socialLinks: SocialLinkData[]
  products: ProductData[]
  embeds: EmbedData[]
  pages: PageData[]
  integrations: IntegrationData[]
}

export function ProfilePreview(props: ProfilePreviewProps) {
  const {
    name, accentColor, theme, showBranding, buttonStyle, bioAlignment,
    buttonTextColor, backgroundColor, avatarShape, fontFamily, fontSize,
    linkBorderWidth, linkShadow, linkSpacing, layoutMode, hoverEffect,
    showAvatar, showBio, headerImageUrl, customCss, isLocked, pagePassword,
    buttonBorderColor, buttonFontWeight, countdownTitle, countdownDate,
    enableEmailCapture, emailCaptureTitle, metaTitle, metaDescription, ogImageUrl,
    tipEnabled, tipVenmo, tipPayPal, tipCashApp,
    links, socialLinks, products, embeds, pages, integrations,
    username, isPro, bio, avatarUrl,
  } = props

  return (
    <div className="sticky top-4 hidden lg:block">
      <div className="relative mx-auto w-[360px]">
        <div className="absolute inset-0 rounded-[3rem] border-[4px] border-gray-800 shadow-xl pointer-events-none" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-2 bg-gray-800 rounded-full z-10 pointer-events-none" />
        <div className="pt-9 pb-4 px-2">
          <div className="w-full h-[620px] overflow-y-auto rounded-[1.5rem] bg-white scrollbar-thin">
            <PublicProfile
              name={name}
              bio={bio}
              avatarUrl={avatarUrl}
              theme={theme}
              accentColor={accentColor}
              showBranding={showBranding}
              buttonStyle={buttonStyle}
              bioAlignment={bioAlignment}
              buttonTextColor={buttonTextColor || null}
              backgroundColor={backgroundColor || null}
              avatarShape={avatarShape}
              fontFamily={fontFamily}
              fontSize={fontSize}
              linkBorderWidth={linkBorderWidth}
              linkShadow={linkShadow}
              linkSpacing={linkSpacing}
              layoutMode={layoutMode}
              hoverEffect={hoverEffect}
              showAvatar={showAvatar}
              showBio={showBio}
              headerImageUrl={headerImageUrl}
              customCss={customCss}
              isLocked={isLocked}
              pagePassword={pagePassword}
              buttonBorderColor={buttonBorderColor || null}
              buttonFontWeight={buttonFontWeight}
              countdownTitle={countdownTitle}
              countdownDate={countdownDate || null}
              enableEmailCapture={enableEmailCapture}
              emailCaptureTitle={emailCaptureTitle}
              tipEnabled={tipEnabled}
              tipVenmo={tipVenmo}
              tipPayPal={tipPayPal}
              tipCashApp={tipCashApp}
              links={links}
              socialLinks={socialLinks}
              products={products}
              embeds={embeds}
              pages={pages}
              integrations={integrations}
              username={username}
              isPro={isPro}
              preview
            />
          </div>
        </div>
      </div>
    </div>
  )
}
