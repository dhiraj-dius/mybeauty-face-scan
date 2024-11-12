export const downloadImage = (base64String, fileName, fileFormat) => {
  try {
    console.log(base64String)
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')

    console.log(base64Data)
    // Convert base64 to blob
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: `image/${fileFormat}` })

    // Create download link
    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = `${fileName}.${fileFormat}`

    // Trigger download
    document.body.appendChild(downloadLink)
    downloadLink.click()

    // Cleanup
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(downloadLink.href)
  } catch (error) {
    const typedError = error instanceof Error ? error : new Error('Unknown error occurred')
    console.error('Error downloading image:', typedError)
  }
}
