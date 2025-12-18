import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authImage = placeholderImages.placeholderImages.find(
    (p) => p.id === 'auth-background'
  );

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">{children}</div>
      </div>
      <div className="hidden bg-muted lg:block">
        {authImage && (
          <Image
            src={authImage.imageUrl}
            alt={authImage.description}
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            data-ai-hint={authImage.imageHint}
          />
        )}
      </div>
    </div>
  );
}
