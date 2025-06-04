// Manage email storage for Firebase email link authentication
class FirebaseEmailStorage {
  private readonly EMAIL_KEY = "emailForSignIn"
  private readonly TIMESTAMP_KEY = "emailForSignIn_timestamp"
  private readonly EXPIRY_TIME = 60 * 60 * 1000 // 1 hour

  saveEmail(email: string): void {
    try {
      localStorage.setItem(this.EMAIL_KEY, email)
      localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      console.warn("Failed to save email to localStorage:", error)
    }
  }

  getEmail(): string | null {
    try {
      const email = localStorage.getItem(this.EMAIL_KEY)
      const timestamp = localStorage.getItem(this.TIMESTAMP_KEY)

      if (!email || !timestamp) {
        return null
      }

      // Check if stored email has expired
      const storedTime = Number.parseInt(timestamp, 10)
      if (Date.now() - storedTime > this.EXPIRY_TIME) {
        this.clearEmail()
        return null
      }

      return email
    } catch (error) {
      console.warn("Failed to get email from localStorage:", error)
      return null
    }
  }

  clearEmail(): void {
    try {
      localStorage.removeItem(this.EMAIL_KEY)
      localStorage.removeItem(this.TIMESTAMP_KEY)
    } catch (error) {
      console.warn("Failed to clear email from localStorage:", error)
    }
  }

  hasStoredEmail(): boolean {
    return this.getEmail() !== null
  }
}

export const firebaseEmailStorage = new FirebaseEmailStorage()
