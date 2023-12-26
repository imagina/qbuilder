export interface Block {
  id: number
}

export interface Layout {
  id: number,
  title: string,
  blocks: Block[]
}

export interface MediaFiles {
  internalimage:   Image;
  blockbgimage:    Image;
  custommainimage: Image;
  customgallery:   any[];
}

export interface Image {
  id:                      any;
  filename:                any;
  mimeType:                any;
  fileSize:                any;
  path:                    string;
  relativePath:            string;
  isImage:                 boolean;
  isVideo:                 boolean;
  isFolder:                boolean;
  mediaType:               boolean;
  folderId:                any;
  description:             any;
  alt:                     any;
  keywords:                any;
  createdBy:               any;
  createdAt:               any;
  updatedAt:               any;
  faIcon:                  string;
  disk:                    any;
  extension:               any;
  url:                     string;
  createdByUser:           any;
  tags:                    any[];
  thumbnails:              Thumbnail[];
  smallThumb:              string;
  relativeSmallThumb:      string;
  mediumThumb:             string;
  relativeMediumThumb:     string;
  largeThumb:              string;
  relativeLargeThumb:      string;
  extraLargeThumb:         string;
  relativeExtraLargeThumb: string;
}

export interface Thumbnail {
  name: string;
  path: string;
  size: string;
}