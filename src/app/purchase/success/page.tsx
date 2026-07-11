import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function PurchaseSuccess({ searchParams }: { searchParams: { productId?: string; username?: string } }) {
  const { username } = searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.04] px-4">
      <div className="text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Purchase Successful!</h1>
        <p className="text-muted-foreground mb-8">Thank you for your purchase. You will receive a download link via email shortly.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {username ? (
            <Link href={`/${username}`}>
              <Button variant="default">Back to Creator</Button>
            </Link>
          ) : (
            <Link href="/">
              <Button variant="default">Go Home</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
