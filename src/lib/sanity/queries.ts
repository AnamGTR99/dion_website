export const VIDEOS_BY_CATEGORY = `*[_type == "video" && category == $category] | order(order asc) {
  _id,
  title,
  youtubeUrl,
  category,
  subcategory,
  isFeatured,
  order
}`

export const FEATURED_VIDEO = `*[_type == "video" && category == $category && isFeatured == true][0] {
  _id,
  title,
  youtubeUrl,
  category,
  subcategory
}`

export const SITE_INFO = `*[_type == "siteInfo"][0] {
  bio,
  roles,
  clientList,
  contactEmail,
  socialLinks,
  showreelUrl,
  miscContent
}`

export const ALL_VIDEOS = `*[_type == "video"] | order(order asc) {
  _id,
  title,
  youtubeUrl,
  category,
  subcategory,
  isFeatured,
  order
}`
