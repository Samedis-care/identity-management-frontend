export interface Content {
  id: string;
  app: string;
  name: string;
  version: number;
  content_translations: Record<string, string>;
  active: boolean;
  acceptance_required: boolean;
  acceptance_given?: boolean;
  created_at: string;
  updated_at: string;
}
