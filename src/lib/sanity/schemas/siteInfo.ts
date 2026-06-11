const siteInfo = {
  name: 'siteInfo',
  title: 'Site Info',
  type: 'document',
  fields: [
    {
      name: 'bio',
      title: 'Biography',
      type: 'text',
    },
    {
      name: 'roles',
      title: 'Roles',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'clientList',
      title: 'Client List',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', type: 'string', title: 'Platform' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
        },
      ],
    },
    {
      name: 'showreelUrl',
      title: 'Showreel YouTube URL',
      type: 'url',
    },
    {
      name: 'miscContent',
      title: 'Miscellaneous Content',
      type: 'text',
    },
  ],
}

export default siteInfo
