export type EventType = 'view' | 'click' | 'time_spent'

export interface TrackingEvent {
  versionId: string
  type: EventType
  section?: string
  duration?: number
}

/**
 * Track user interactions on proposal landing pages
 * Sends async, non-blocking requests to the tracking API
 */
export async function trackEvent(event: TrackingEvent): Promise<void> {
  try {
    // Fire and forget - don't block user interaction
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {
      // Silently fail - don't interrupt user experience
      console.debug('Tracking failed (non-blocking)')
    })
  } catch (err) {
    // Double catch for safety
    console.debug('Tracking error:', err)
  }
}

/**
 * Track a page view
 */
export function trackView(versionId: string): void {
  trackEvent({
    versionId,
    type: 'view',
  })
}

/**
 * Track a click on a section
 */
export function trackClick(versionId: string, section: string): void {
  trackEvent({
    versionId,
    type: 'click',
    section,
  })
}

/**
 * Track time spent in a section (in seconds)
 */
export function trackTimeSpent(versionId: string, section: string, duration: number): void {
  trackEvent({
    versionId,
    type: 'time_spent',
    section,
    duration,
  })
}
