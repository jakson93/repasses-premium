import { useState, useEffect } from "react";
import { Upload, Trash2, Star, X } from "lucide-react";

interface Image {
  id: number;
  image_url: string;
  display_order: number;
}

interface ImageManagerProps {
  motorcycleId: number;
  currentThumbnail?: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ImageManager({
  motorcycleId,
  currentThumbnail,
  onClose,
  onUpdate,
}: ImageManagerProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, [motorcycleId]);

  const loadImages = async () => {
    try {
      const response = await fetch(`/api/motorcycles/${motorcycleId}`, { credentials: 'include' });
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("image", file);

        await fetch(`/api/motorcycles/${motorcycleId}/images`, { credentials: 'include',
          method: "POST",
          body: formData,
        });
      }

      await loadImages();
      onUpdate();
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Erro ao fazer upload das imagens");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      const response = await fetch(`/api/images/${imageId}`, { credentials: 'include',
        method: "DELETE",
      });

      if (response.ok) {
        await loadImages();
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Erro ao excluir imagem");
    }
  };

  const setAsThumbnail = async (imageUrl: string) => {
    try {
      const response = await fetch(`/api/motorcycles/${motorcycleId}/thumbnail`, { credentials: 'include',
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thumbnail_url: imageUrl }),
      });

      if (response.ok) {
        onUpdate();
        alert("Thumbnail definida com sucesso!");
      }
    } catch (error) {
      console.error("Failed to set thumbnail:", error);
      alert("Erro ao definir thumbnail");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-yellow-500/30">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Gerenciar Imagens</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Area */}
          <div className="mb-8">
            <label className="block w-full cursor-pointer">
              <div className="border-2 border-dashed border-yellow-500/30 rounded-xl p-8 text-center hover:border-yellow-500/60 transition-colors bg-black/30">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="speed-loading rounded-full h-12 w-12 mb-4"></div>
                    <p className="text-gray-400">Enviando imagens...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-yellow-400 mb-4" />
                    <p className="text-white font-semibold mb-2">
                      Clique para fazer upload de imagens
                    </p>
                    <p className="text-gray-400 text-sm">
                      Selecione uma ou múltiplas imagens (JPG, PNG, WebP)
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Images Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="speed-loading rounded-full h-12 w-12"></div>
            </div>
          ) : images.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Imagens ({images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative group rounded-lg overflow-hidden border-2 border-gray-700 hover:border-yellow-500/50 transition-all"
                  >
                    <img
                      src={image.image_url}
                      alt={`Imagem ${image.id}`}
                      className="w-full h-48 object-cover"
                    />

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setAsThumbnail(image.image_url)}
                        className={`p-2 rounded-lg transition-colors ${
                          currentThumbnail === image.image_url
                            ? "bg-yellow-500 text-black"
                            : "bg-gray-700 hover:bg-gray-600 text-white"
                        }`}
                        title={
                          currentThumbnail === image.image_url
                            ? "Thumbnail atual"
                            : "Definir como thumbnail"
                        }
                      >
                        <Star className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                        title="Excluir imagem"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Thumbnail indicator */}
                    {currentThumbnail === image.image_url && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        CAPA
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Upload className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhuma imagem enviada ainda</p>
              <p className="text-gray-500 text-sm mt-2">
                Faça upload de imagens usando o botão acima
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
