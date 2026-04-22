const TRY_GC_THEME_STYLE_ID = 'trygc-theme-vars'

export const TRY_GC_THEME = {
  brand: {
    orange: '#E8630C',
    orangeSoft: '#FDF2E9',
    orangeMid: 'rgba(232,99,12,0.08)',
    purple: '#52358C',
    purpleMid: '#7255B5',
    purpleLight: '#A798BF',
    purpleSoft: '#EEEAF4',
    purpleMidAlpha: 'rgba(82,53,140,0.12)',
    peach: '#E3A579',
    peachSoft: '#FCF1E9',
    lavenderSoft: '#F3EFF8',
  },
  light: {
    bg: '#FBFAFC',
    card: '#FFFFFF',
    row: '#F3EFF8',
    deep: '#EEEAF4',
    border: '#EEE9F1',
    border2: '#DCD4E2',
    nav: '#FFFFFF',
    text1: '#1A1220',
    text2: '#433651',
    text3: '#6B5E78',
    text4: '#A89FB0',
    navActiveBg: '#EEEAF4',
    navActiveColor: '#52358C',
    rowHover: '#EEEAF4',
    tblHeadBg: '#FBFAFC',
  },
  dark: {
    bg: '#0D0818',
    card: '#160D2C',
    row: '#1C1035',
    deep: '#251545',
    border: '#2D1A55',
    border2: '#3D2470',
    nav: '#0A0520',
    text1: '#F0EBFF',
    text2: '#C4ADE8',
    text3: '#9B87C4',
    text4: '#6B5A8E',
    navActiveBg: 'rgba(82,53,140,0.25)',
    navActiveColor: '#C4ADE8',
    rowHover: 'rgba(82,53,140,0.14)',
    tblHeadBg: 'rgba(255,255,255,0.02)',
  },
  feedback: {
    info: '#3B82F6',
    success: '#22C55E',
    warning: '#CA8A04',
    danger: '#EF4444',
    cyan: '#7dd3fc',
  },
} as const

type CssVariableMap = Record<`--${string}`, string>

const WHITE_HSL = '0 0% 100%'

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const padded = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized
  const value = Number.parseInt(padded, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function hexToHslChannels(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  let hue = 0

  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
  }

  return `${Math.round((hue * 60 + 360) % 360)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`
}

function serializeCssVariableMap(variables: CssVariableMap) {
  return Object.entries(variables).map(([name, value]) => `${name}:${value};`).join('')
}

function makeThemeVars(palette: typeof TRY_GC_THEME.light | typeof TRY_GC_THEME.dark): CssVariableMap {
  return {
    '--bg': palette.bg,
    '--card': palette.card,
    '--c2': palette.row,
    '--c3': palette.deep,
    '--bd': palette.border,
    '--bdl': palette.border2,
    '--nav': palette.nav,
    '--t': palette.text1,
    '--t2': palette.text2,
    '--t3': palette.text3,
    '--tm': palette.text4,
    '--nav-active-bg': palette.navActiveBg,
    '--nav-active-color': palette.navActiveColor,
    '--row-hover': palette.rowHover,
    '--tbl-head-bg': palette.tblHeadBg,
    '--background': hexToHslChannels(palette.bg),
    '--foreground': hexToHslChannels(palette.text1),
    '--card-foreground': hexToHslChannels(palette.text1),
    '--popover': hexToHslChannels(palette.bg),
    '--popover-foreground': hexToHslChannels(palette.text1),
    '--secondary': hexToHslChannels(palette.deep),
    '--secondary-foreground': hexToHslChannels(palette.text1),
    '--muted': hexToHslChannels(palette.row),
    '--muted-foreground': hexToHslChannels(palette.text2),
    '--input': hexToHslChannels(palette.border),
  }
}

export const ROOT_THEME_CSS_VARIABLES: CssVariableMap = {
  '--o': TRY_GC_THEME.brand.orange,
  '--o-soft': TRY_GC_THEME.brand.orangeSoft,
  '--o-mid': TRY_GC_THEME.brand.orangeMid,
  '--p': TRY_GC_THEME.brand.purple,
  '--pm': TRY_GC_THEME.brand.purpleMid,
  '--pl': TRY_GC_THEME.brand.purpleLight,
  '--p-soft': TRY_GC_THEME.brand.purpleSoft,
  '--p-mid': TRY_GC_THEME.brand.purpleMidAlpha,
  '--peach': TRY_GC_THEME.brand.peach,
  '--peach-soft': TRY_GC_THEME.brand.peachSoft,
  '--lavender-soft': TRY_GC_THEME.brand.lavenderSoft,
  '--blue': TRY_GC_THEME.feedback.info,
  '--green': TRY_GC_THEME.feedback.success,
  '--amber': TRY_GC_THEME.feedback.warning,
  '--red': TRY_GC_THEME.feedback.danger,
  '--cyan': TRY_GC_THEME.feedback.cyan,
  '--primary': hexToHslChannels(TRY_GC_THEME.brand.purple),
  '--primary-foreground': WHITE_HSL,
  '--destructive': hexToHslChannels(TRY_GC_THEME.feedback.danger),
  '--destructive-foreground': WHITE_HSL,
  '--ring': hexToHslChannels(TRY_GC_THEME.brand.purple),
  '--accent-foreground': WHITE_HSL,
  ...makeThemeVars(TRY_GC_THEME.light),
}

export const LIGHT_THEME_CSS_VARIABLES = makeThemeVars(TRY_GC_THEME.light)
export const DARK_THEME_CSS_VARIABLES = makeThemeVars(TRY_GC_THEME.dark)

export function installTryGcThemeVariables(doc: Document = document) {
  const rootRule = `:root{color-scheme:light;${serializeCssVariableMap(ROOT_THEME_CSS_VARIABLES)}}`
  const darkRule = `[data-theme='dark']{color-scheme:dark;${serializeCssVariableMap(DARK_THEME_CSS_VARIABLES)}}`

  let styleTag = doc.getElementById(TRY_GC_THEME_STYLE_ID) as HTMLStyleElement | null
  if (!styleTag) {
    styleTag = doc.createElement('style')
    styleTag.id = TRY_GC_THEME_STYLE_ID
    doc.head.appendChild(styleTag)
  }

  styleTag.textContent = rootRule + darkRule
}

export const STAGE_COLOR_MAP = {
  'Leads & Calls': TRY_GC_THEME.brand.purpleLight,
  Meeting: TRY_GC_THEME.brand.purpleMid,
  Quotations: '#F59E0B',
  Opportunities: TRY_GC_THEME.feedback.info,
  Plans: TRY_GC_THEME.brand.orange,
  'Pending for closure': '#EA580C',
  'Closed – With Contract': TRY_GC_THEME.feedback.success,
  'Closed – No Contract': TRY_GC_THEME.feedback.warning,
  Lost: TRY_GC_THEME.feedback.danger,
} as const

export type StageName = keyof typeof STAGE_COLOR_MAP
