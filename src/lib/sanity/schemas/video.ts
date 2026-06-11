const video = {
  name: 'video',
  title: 'Video',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Videography', value: 'videography' },
          { title: 'Photography', value: 'photography' },
          { title: 'Animation', value: 'animation' },
          { title: 'Clothing Design', value: 'clothing-design' },
          { title: 'Design / Creative Direction', value: 'design-creative-direction' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'subcategory',
      title: 'Sub-category (Videography only)',
      type: 'string',
      options: {
        list: [
          { title: 'Social Media', value: 'social-media' },
          { title: 'Short Films', value: 'short-films' },
          { title: 'Ads', value: 'ads' },
          { title: 'Documentaries', value: 'documentaries' },
          { title: 'Non-commercial', value: 'non-commercial' },
        ],
      },
      hidden: ({ parent }: any) => parent?.category !== 'videography',
    },
    {
      name: 'isFeatured',
      title: 'Featured?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    },
  ],
}

export default video
