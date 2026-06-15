export interface Student {
  id: number;
  name: string;
  grade: string;
  class_name: string;
  group?: string | null;
  date_of_birth: string;
  parent_name: string;
  parent_phone: string;
  image_url?: string | null;
  image_folder?: string | null;
  image_name?: string | null;
  achievements?: string[];
  certificates?: string[];
  attendance?: Array<{
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    note?: string;
  }>;
  is_active?: boolean;
  created_at?: string;
  updated_at: string;
}
