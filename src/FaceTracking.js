import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Face3D, SliderSide } from '@holition/face3d'
import { downloadImage } from './downloadImage'

const useLogger = (maxLogs) => {
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    const newLog = `FEEDBACK: ${message}`

    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      return updatedLogs.slice(-maxLogs); // Keep only the last maxLogs entries
    })
  };

  const clearLogs = () => setLogs([])

  return { logs, addLog, clearLogs }
}

const FaceTracking = () => {
  // Create refs for the container and Face3D instance
  const containerRef = useRef(null)
  const face3dRef = useRef(null)
  const [showSlider, setShowSlider] = useState(false)
  const { logs, addLog, clearLogs } = useLogger(1000)
  const [ faceScan, setFaceScan ] = useState({
    completed: true,
    result: {}
  })

  const canVisualiseResults = useMemo(() => Object.keys(faceScan.result).length !== 0, [faceScan])

  useEffect(() => {
    // Initialize Face3D when component mounts
    const initializeFace3D = async () => {
      try {
        // Create Face3D instance
        face3dRef.current = await Face3D.create({
          container: containerRef.current,
        })

        // Initialize webcam
        await face3dRef.current.setInput({
          type: 'webcam',
          displayFit: 'cover',
        })
      } catch (error) {
        console.error('Error initializing Face3D:', error)
      }
    }

    // Call initialization
    initializeFace3D()

    // Cleanup function when component unmounts
    return () => {
      if (face3dRef.current) {
        // Add any necessary cleanup for Face3D instance
        // (Check SDK documentation for proper cleanup methods)
      }
    }
  }, []) // Empty dependency array means this runs once on mount

  const onDownloadImage = async () => {
    try {
      const base64image = await face3dRef.current.takeScreenshot()
      downloadImage(base64image, 'face_shot', 'png')
    } catch (error) {
      console.error('Error taking screenshot:', error)
    }
  }

  const toggleSlider = () => {
    if (!showSlider) {
      face3dRef.current.setVisibilitySlider(0.5, SliderSide.LEFT)
      setShowSlider(true)
    } else {
      face3dRef.current.setVisibilitySlider(1.0, SliderSide.LEFT)
      setShowSlider(false)
    }
  }

  const onFaceScan = async () => {
    clearLogs()
    setFaceScan({
      completed: false,
      result: {}
    })
    const faceScanResult = await face3dRef.current.startFaceScan({
      features: {
        ageGender: true,
        eyeColour: true,
        faceMeasurements: true,
        faceShape: true,
        skinHealth: true,
        skinTone: true,
        skinType: true,
        skinReport: false
      },
      options: {
        imageQuality: {
          callback: ({ feedback, completed }) => {
            addLog(`image has ${feedback}`)
    
            if (completed) {
              addLog('Image quality completed!')
              setFaceScan({
                ...faceScan,
                completed: true
              })
            }
          }
        },
        iterations: 1
      },
      onProgress: (progress) => {
        console.log('progress ', progress)
      },
    })
    setFaceScan({
      ...faceScan,
      result: faceScanResult
    })
  }

  const onVisualiseResults = async (event) => {
    if (event.target.value === 'none') {
      face3dRef.current.hideScanResults()
    } else {
      await face3dRef.current.visualiseScanResults({
        type: event.target.value,
        results: faceScan.result,
        config: {
          visualType: 'colours',
        }
      }) 
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'row', padding: '12px', gap: '16px' }}>
        <button
          onClick={onDownloadImage}
          type="button"
        >
          Take screenshot
        </button>
        <button
          onClick={toggleSlider}
          type="button"
        >
          {showSlider ? 'Hide slider' : 'Show slider'}
        </button>
        <button
          onClick={onFaceScan}
          disabled={!faceScan.completed}
          type="button"
        >
          Face scan
        </button>
        <select defaultValue="none" onChange={onVisualiseResults} disabled={!canVisualiseResults}>
          <option value="none" selected>none</option>
          <option value="spots">spots</option>
          <option value="darkSpots">darkSpots</option>
          <option value="wrinkles">wrinkles</option>
          <option value="skinType">skinType</option>
        </select>
      </div>
      <div 
        ref={containerRef}
        className="face-sdk-container"
        style={{ width: '100%', height: '70vh' }}
      />
      <div style={{ display: 'flex', flexDirection: 'row', height: '20vh' }}>
        <div style={{ border: '1px solid', height: '100%', padding: '12px', width: '50vw', overflowY: 'scroll', textAlign: 'left' }} >
          <pre style={{ margin: 0 }}>
            { JSON.stringify(faceScan.result, null, 2) }
          </pre>
        </div>
        <div style={{ border: '1px solid', height: '100%', padding: '12px', width: '50vw', overflowY: 'scroll' }} >
          {logs.map((log, index) => (
            <p style={{ textAlign: 'left', margin: 0 }} key={index}>{log}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FaceTracking
