import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePostForm() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const createPost = useCreatePost();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed per post');
      return;
    }

    setUploading(true);
    try {
      const newImages: ExternalBlob[] = [];
      const newPreviews: string[] = [];

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        newImages.push(blob);
        newPreviews.push(URL.createObjectURL(file));
      }

      setImages([...images, ...newImages]);
      setImagePreviews([...imagePreviews, ...newPreviews]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      toast.error('Please add some content or images');
      return;
    }

    await createPost.mutateAsync({ content: content.trim(), images });
    setContent('');
    setImages([]);
    setImagePreviews([]);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="resize-none"
          />
          
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="post-images"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ImagePlus className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {uploading ? 'Uploading...' : `Add Photos (${images.length}/5)`}
                </span>
              </label>
              <input
                id="post-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || images.length >= 5}
              />
            </div>
            <Button
              type="submit"
              disabled={(!content.trim() && images.length === 0) || createPost.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createPost.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
