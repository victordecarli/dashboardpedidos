export const compressImage = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calcula as novas dimensões mantendo a proporção
          let width = img.width;
          let height = img.height;
          const maxSize = 1024;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          // Define o tamanho do canvas
          canvas.width = width;
          canvas.height = height;

          // Desenha a imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Converte para blob com qualidade reduzida
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            0.8, // 80% de qualidade
          );
        };
      };

      reader.onerror = (error) => reject(error);
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      resolve(file); // Em caso de erro, retorna o arquivo original
    }
  });
};
