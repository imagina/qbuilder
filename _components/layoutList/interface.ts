import {Block} from '@imagina/qbuilder/_components/blocksPanel/interface'
import {MediaFiles} from "@imagina/qbuilder/_pages/admin/editor/interface";

export interface Layout {
  blocks:         Block[];
  createdAt:      Date;
  createdBy:      number;
  default:        number;
  deletedAt:      Date | null;
  deletedBy:      number | null;
  entityType:     string;
  id:             number;
  organizationId: any;
  status:         number;
  systemName:     string;
  title:          string;
  type:           string | null;
  updatedAt:      Date;
  updatedBy:      number;
  mediaFiles:     MediaFiles;
}
