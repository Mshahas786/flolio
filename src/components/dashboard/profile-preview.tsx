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
    <div className="sticky top-4 self-start hidden lg:block">
      <div className="relative mx-auto w-[340px]">
        <div className="absolute inset-0 rounded-[2.5rem] border-[4px] border-gray-800 shadow-xl pointer-events-none" />
        <div className="pt-4 pb-3 px-[3px]">
          <div className="w-full h-[640px] overflow-y-auto rounded-[2.2rem] bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
