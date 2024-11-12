"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isBefore, formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, Lock } from "lucide-react"
import { Galindo } from 'next/font/google'
import { motion } from "framer-motion"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { StoredClosureData } from "@/lib/types"


const galindo = Galindo({
  weight: '400',
  subsets: ['latin'],
})

type DayStatus = {
  date: string
  isOpen: boolean
  opensAt: string | null
  closesAt: string | null
}

// type TrailData = {
//   [date: string]: {
//     isOpen: boolean
//     conditions: {
//       raw: string
//       opensAt: string
//       closesAt: string
//     }
//     rawText: string
//   }
// }

const DATA_URL = "https://a1jaotnvc8xv5m0n.public.blob.vercel-storage.com/aldershotTrainingAreaData.json"
const CACHE_KEY = "deepcutTrailData"

/**
 * Fetch the data from the Vercel Blob and cache it until 2am
 */
async function fetchData(): Promise<StoredClosureData> {
  const cachedData = localStorage.getItem(CACHE_KEY)
  if (cachedData) {
    const { data, expiry } = JSON.parse(cachedData)
    if (isBefore(new Date(), new Date(expiry))) {
      return data
    }
  }

  const response = await fetch(DATA_URL)
  const data: StoredClosureData = await response.json()

  const twoAm = new Date()
  twoAm.setUTCHours(2, 0, 0, 0)
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, expiry: twoAm.toISOString() }))

  return data
}

const StatusIcon = ({ isOpen, className, size = "large" }: { isOpen: boolean; className?: string; size?: "small" | "large" }) => {
  const Icon = isOpen ? ThumbsUp : Lock
  const sizeClass = size === "large" ? "h-12 w-12" : "h-5 w-5"
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Icon className={`${sizeClass} ${isOpen ? "text-electric-green" : "text-electric-red"}`} />
    </div>
  )
}

const OpeningTimes = ({ isOpen, opensAt, closesAt }: { isOpen: boolean; opensAt?: string; closesAt?: string }) => {
  if (!isOpen && opensAt && closesAt) {
    return <span className="text-sm mt-2 text-electric-green">{opensAt} - {closesAt}</span>
  } else if (!isOpen && opensAt) {
    return <span className="text-sm mt-2 text-electric-green">Opens at {opensAt}</span>
  }
  return null
}

export default function Page() {
  const [weekStatus, setWeekStatus] = useState<DayStatus[]>([])
  const [showAll, setShowAll] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    async function loadData() {
      const trailData = await fetchData()
      const sortedDates = Object.keys(trailData.data).sort()
      const weekData = sortedDates.map(date => ({
        date,
        isOpen: trailData.data[date].isOpen,
        opensAt: trailData.data[date].conditions?.opensAt ?? null,
        closesAt: trailData.data[date].conditions?.closesAt ?? null
      }))
      setWeekStatus(weekData)

      if (trailData.retrievedAt) {
        const retrievedDate = new Date(trailData.retrievedAt)
        const timeString = retrievedDate.toLocaleTimeString('en-GB', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).toLowerCase()
        setLastUpdated(`(updated ${formatDistanceToNow(retrievedDate, { addSuffix: true })})`)
      }
    }

    loadData()
  }, [])

  const getDayLabel = (date: string, index: number) => {
    const today = new Date()
    const dayDate = parseISO(date)
    if (format(today, 'yyyy-MM-dd') === date) return "Today"
    if (format(parseISO(weekStatus[1]?.date), 'yyyy-MM-dd') === date) return "Tomorrow"
    return format(dayDate, "EEEE, MMM d")
  }

  return (
    <div className="min-h-screen bg-[#0a3200] text-electric-green p-6 font-sans">
      <header className="mb-8">
        <h1 className={`${galindo.className} text-4xl tracking-wider font-bold text-center mb-2 text-white`}>
          Deepcut Trail Status
        </h1>
        <p className="text-center font-semibold text-electric-green">
          MoD Data - Aldershot Training Area G2 {" "}
          <span className="text-sm font-normal md:inline block">{lastUpdated}</span>
        </p>
      </header>
      <main>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {weekStatus.slice(0, 2).map((day, index) => (
            <Card key={day.date} className={`bg-[#0f4700] border-2 ${day.isOpen ? "border-electric-green" : "border-electric-red"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white">{getDayLabel(day.date, index)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-32">
                  <StatusIcon isOpen={day.isOpen} className="mb-2" />
                  <span className={`text-2xl font-bold ${day.isOpen ? "text-electric-green" : "text-electric-red"}`}>
                    {day.isOpen ? "Open" : "Closed"}
                  </span>
                  <OpeningTimes isOpen={day.isOpen} opensAt={day.opensAt} closesAt={day.closesAt} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {weekStatus.slice(2, showAll ? undefined : 7).map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.max(0, index-7) * 0.1 }}
            >
              <Card className={`bg-[#0f4700] border ${day.isOpen ? "border-electric-green" : "border-electric-red"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">{getDayLabel(day.date, index + 2)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <StatusIcon isOpen={day.isOpen} size="small" />
                      <span className={`font-semibold ${day.isOpen ? "text-electric-green" : "text-electric-red"}`}>
                        {day.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                    <OpeningTimes isOpen={day.isOpen} opensAt={day.opensAt} closesAt={day.closesAt} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {weekStatus.length > 7 && !showAll && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="bg-[#a3ff78] text-[#0a3200] px-4 py-2 rounded-full font-bold hover:bg-[#8aff5a] transition-colors"
            >
              Show More
            </button>
          </div>
        )}
      </main>
      <footer className="mt-8 text-center text-electric-green">
          <p className="text-center space-x-1">
            Made <em>(mostly with AI)</em> by
            <a href="https://mark.fullbrook.me">Mark Fullbrook</a>

            {/* <a
              href="https://github.com/mfullbrook/deepcut.fun"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiGithub className="h-4 w-4" color="default" size={24} />
            </a> */}
          </p>
      </footer>
    </div>
  )
}
