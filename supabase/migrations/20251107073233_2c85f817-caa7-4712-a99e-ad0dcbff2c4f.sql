-- Create storage bucket for CPF documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('cpf-documents', 'cpf-documents', false);

-- Allow admins to upload documents
CREATE POLICY "Admins can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cpf-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to read documents
CREATE POLICY "Admins can read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cpf-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete documents
CREATE POLICY "Admins can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cpf-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow everyone to read documents (for the chatbot to access)
CREATE POLICY "Public read access for chatbot"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'cpf-documents');