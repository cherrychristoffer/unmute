const shop = new URLSearchParams(window.location).get('host')

let spacesBucket, s3Bucket, variants, collageVariants

let AIEnhancedVariants = []

if (['unmuteframes.myshopify.com', '127.0.0.1:9293'].includes(shop)) {
  s3Bucket = 'unmute-prod-v2'
  spacesBucket = 'unmute-prod-v2'

  collageVariants = [
    {
      id: 50355211927816,
      passpartout: 'none',
      orientation: 'portrait',
    },
    {
      id: 50880628883720,
      passpartout: 'none',
      orientation: 'landscape',
    },
    {
      id: 50367657771272,
      passpartout: 2,
      orientation: 'portrait',
    },
    {
      id: 50880628916488,
      passpartout: 2,
      orientation: 'landscape',
    },
    {
      id: 50367657836808,
      passpartout: 5,
      orientation: 'portrait',
    },
    {
      id: 50880628949256,
      passpartout: 5,
      orientation: 'landscape',
    },
    {
      id: 50367657902344,
      passpartout: 7,
      orientation: 'portrait',
    },
    {
      id: 50880628982024,
      passpartout: 7,
      orientation: 'landscape',
    },
  ]
  variants = [
    {
      id: 50334471225608,
      passpartout: 'none',
      orientation: 'portrait',
    },
    {
      id: 50334471258376,
      passpartout: 'none',
      orientation: 'landscape',
    },
    {
      id: 50334471291144,
      passpartout: 2,
      orientation: 'portrait',
    },
    {
      id: 50334471323912,
      passpartout: 2,
      orientation: 'landscape',
    },
    {
      id: 50334471356680,
      passpartout: 5,
      orientation: 'portrait',
    },
    {
      id: 50334471389448,
      passpartout: 5,
      orientation: 'landscape',
    },
    {
      id: 50334471422216,
      passpartout: 7,
      orientation: 'portrait',
    },
    {
      id: 50334471454984,
      passpartout: 7,
      orientation: 'landscape',
    },
  ]

  AIEnhancedVariants = [
    {
      id: 50462587060488,
      passpartout: 'none',
      orientation: 'portrait',
    },
    {
      id: 50462589550856,
      passpartout: 'none',
      orientation: 'landscape',
    },
    {
      id: 50462622908680,
      passpartout: 2,
      orientation: 'portrait',
    },
    {
      id: 50462631264520,
      passpartout: 2,
      orientation: 'landscape',
    },
    {
      id: 50462661902600,
      passpartout: 5,
      orientation: 'portrait',
    },
    {
      id: 50334471913736,
      passpartout: 5,
      orientation: 'landscape',
    },
    {
      id: 50462671274248,
      passpartout: 7,
      orientation: 'portrait',
    },
    {
      id: 50462671831304,
      passpartout: 7,
      orientation: 'landscape',
    },
  ]
} else {
  // production
  s3Bucket = 'unmute-prod-v2'
  spacesBucket = 'unmute-prod-v2'

  collageVariants = [
    {
      id: 49840375857490,
      passpartout: 'none',
      orientation: 'portrait',
    },
    {
      id: 50350798012754,
      passpartout: 'none',
      orientation: 'landscape',
    },
    {
      id: 49840375890258,
      passpartout: 2,
      orientation: 'portrait',
    },
    {
      id: 50350798045522,
      passpartout: 2,
      orientation: 'landscape',
    },
    {
      id: 49840375923026,
      passpartout: 5,
      orientation: 'portrait',
    },
    {
      id: 50350798078290,
      passpartout: 5,
      orientation: 'landscape',
    },
    {
      id: 49840375955794,
      passpartout: 7,
      orientation: 'portrait',
    },
    {
      id: 50350798111058,
      passpartout: 7,
      orientation: 'landscape',
    },
  ]
  variants = [
    {
      id: 49730139357522,
      passpartout: 'none',
      orientation: 'portrait',
    },
    {
      id: 49730139390290,
      passpartout: 'none',
      orientation: 'landscape',
    },
    {
      id: 49358818738514,
      passpartout: 2,
      orientation: 'portrait',
    },
    {
      id: 49358841217362,
      passpartout: 2,
      orientation: 'landscape',
    },
    {
      id: 49358841250130,
      passpartout: 5,
      orientation: 'portrait',
    },
    {
      id: 49358841282898,
      passpartout: 5,
      orientation: 'landscape',
    },
    {
      id: 49358841315666,
      passpartout: 7,
      orientation: 'portrait',
    },
    {
      id: 49358841348434,
      passpartout: 7,
      orientation: 'landscape',
    },
  ]

  AIEnhancedVariants = [
    {
      id: 49961295708498,
      passpartout: 'none',
      orientation: 'portrait',
    },
    {
      id: 49961305112914,
      passpartout: 'none',
      orientation: 'landscape',
    },
    {
      id: 49961312420178,
      passpartout: 2,
      orientation: 'portrait',
    },
    {
      id: 49961315696978,
      passpartout: 2,
      orientation: 'landscape',
    },
    {
      id: 49961321595218,
      passpartout: 5,
      orientation: 'portrait',
    },
    {
      id: 49961322774866,
      passpartout: 5,
      orientation: 'landscape',
    },
    {
      id: 49961323757906,
      passpartout: 7,
      orientation: 'portrait',
    },
    {
      id: 49961331327314,
      passpartout: 7,
      orientation: 'landscape',
    },
  ]
}

export const shopifyCollageVariants = collageVariants
export const shopifyVariants = variants

export const enhancedVariants = AIEnhancedVariants

export const SPACES_BUCKET = spacesBucket
export const SPACES_KEY_SECRET = 'kb8jVWbVSiCcSymuwjaKLcK24Xe9A0/tkz2B3TKcCcM'
export const SPACES_KEY_ID = 'DO00RMTVEX87PXVBFJAR'

export const S3_BUCKET = s3Bucket

export const AWS_KEY_ID = 'AKIA4HWJT2PJZ7YUP3AW'
export const AWS_KEY_SECRET = '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'

export const S3_REGION = 'eu-north-1'
export const BASE_API_URL = 'https://api.unmutegreetings.dk/api/v1'

export const cssGrids = {
  portrait: {
    collage_1_1: {
      gridTemplateColumns: 'grid-cols-1',
      items: ['', ''],
    },
    collage_1_2: {
      gridTemplateColumns: 'grid-cols-2',
      items: ['col-span-2', '', ''],
    },
    collage_2_2: {
      gridTemplateColumns: 'grid-cols-2',
      items: ['h-full', 'h-full', 'h-full', 'h-full'],
    },
    collage_2_1_2: {
      gridTemplateColumns: 'grid-cols-2',
      items: ['', '', 'col-span-2', '', ''],
    },
    collage_1_2_2: {
      gridTemplateColumns: 'grid-cols-2',
      items: ['col-span-2', '', '', '', ''],
    },
    collage_2_2_2: {
      gridTemplateColumns: 'grid-cols-2',
      items: ['', '', '', '', '', ''],
    },
    collage_4_2_1_2_4: {
      gridTemplateColumns: 'grid-cols-4 grid-rows-4',
      items: [
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'col-span-2 row-span-2',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
      ],
    },
    collage_2_2_1: {
      gridTemplateColumns: 'grid-cols-2 grid-rows-6',
      items: [
        'row-span-2',
        'row-span-3',
        'row-span-2',
        'row-span-3',
        'row-span-2',
      ],
    },
  },
  landscape: {
    collage_1_1: {
      gridTemplateColumns: 'grid-cols-2',
      items: ['', ''],
    },
    collage_1_2: {
      gridTemplateColumns: 'grid-cols-2',
      items: ['', 'row-span-2', ''],
    },
    collage_2_2: {
      gridTemplateColumns: 'grid-cols-2',
      items: ['h-full', 'h-full', 'h-full', 'h-full'],
    },
    collage_2_1_2: {
      gridTemplateColumns: 'grid-cols-3',
      items: ['', 'row-span-2', '', '', ''],
    },
    collage_1_2_2: {
      gridTemplateColumns: 'grid-cols-3',
      items: ['', '', 'row-span-2', '', ''],
    },
    collage_2_2_2: {
      gridTemplateColumns: 'grid-cols-3',
      items: ['', '', '', '', '', ''],
    },
    collage_4_2_1_2_4: {
      gridTemplateColumns: 'grid-cols-4 grid-rows-4',
      items: [
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'col-span-2 row-span-2',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
        'hide-label',
      ],
    },
    collage_2_2_1: {
      gridTemplateColumns: 'grid-cols-6 grid-rows-2',
      items: [
        'col-span-2',
        'col-span-2',
        'col-span-2',
        'col-span-3',
        'col-span-3',
      ],
    },
  },
}
