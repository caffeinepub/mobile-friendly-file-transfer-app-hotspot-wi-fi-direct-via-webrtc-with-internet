import { AlertCircle, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FilePermissionPromptCardProps {
  state: 'rationale' | 'denied' | 'checking';
  title: string;
  body: string;
  settingsInstructions?: string;
  onContinue?: () => void;
  onNotNow?: () => void;
  onTryAgain?: () => void;
  onOpenSettings?: () => void;
  canOpenSettings?: boolean;
}

/**
 * Reusable permission prompt card for Android file picker permission flow.
 * Displays rationale before requesting, denial guidance after denial, and loading state during checks.
 */
export default function FilePermissionPromptCard({
  state,
  title,
  body,
  settingsInstructions,
  onContinue,
  onNotNow,
  onTryAgain,
  onOpenSettings,
  canOpenSettings = false,
}: FilePermissionPromptCardProps) {
  if (state === 'checking') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
            <p className="text-sm text-foreground">{title}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === 'rationale') {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-sm">{body}</CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onNotNow}
            className="flex-1"
          >
            Not now
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1"
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (state === 'denied') {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <CardTitle className="text-base text-destructive">{title}</CardTitle>
              <CardDescription className="text-sm text-destructive/90 mt-1">
                {body}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {settingsInstructions && (
          <CardContent className="pt-0">
            <div className="bg-background/50 rounded-lg p-3 border border-destructive/10">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                How to enable:
              </p>
              <p className="text-xs text-foreground">{settingsInstructions}</p>
            </div>
          </CardContent>
        )}
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onTryAgain}
            className="flex-1"
          >
            Try again
          </Button>
          {canOpenSettings && onOpenSettings && (
            <Button
              onClick={onOpenSettings}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Open settings
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return null;
}
