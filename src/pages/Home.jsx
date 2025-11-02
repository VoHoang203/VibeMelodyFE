import { Link } from "react-router-dom";
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const features = [
  {
    title: "Vast Music Library",
    description: "Millions of songs from around the world, every music genre you love",
    image: "/music-library.png",
    gradient: "from-purple-900 to-blue-900",
  },
  {
    title: "Free Album Publishing",
    description: "Artists can freely upload and manage their albums, share music with the world",
    image: "/music-upload-interface.png",
    gradient: "from-pink-900 to-purple-900",
  },
  {
    title: "Connect with Friends",
    description: "Connect with friends, share playlists, see what they're listening to and chat directly",
    image: "/social-music.jpg",
    gradient: "from-blue-900 to-teal-900",
  },
]

const trending = [
  { name: "Urban Jungle", artist: "City Lights", image: "/urban-jungle.jpg" },
  { name: "Inner Light", artist: "Shocking Lemon", image: "/inner-light.jpg" },
  { name: "Neon Lights", artist: "Night Runners", image: "/neon-lights.jpg" },
  { name: "Summer Daze", artist: "Coastal Kids", image: "/summer-beach-scene.png" },
  { name: "Purple Sunset", artist: "Dream Valley", image: "/purple-sunset.jpg" },
  { name: "Starlight", artist: "Luna Bay", image: "/starlight.jpg" },
]

const newest = [
  { name: "Lost in Tokyo", artist: "Electric Dreams", image: "/tokyo-night.png" },
  { name: "Purple Sunset", artist: "Dream Valley", image: "/purple-sunset.jpg" },
  { name: "Neon Lights", artist: "Night Runners", image: "/neon-city.jpg" },
  { name: "Test in Prod", artist: "Programmer", image: "/programmer.png" },
  { name: "Urban Jungle", artist: "City Lights", image: "/urban-jungle.jpg" },
  { name: "Summer Daze", artist: "Coastal Kids", image: "/summer-beach-scene.png" },
]

export default function HomePage() {
  const [featureIndex, setFeatureIndex] = useState(0)
  const [trendingStart, setTrendingStart] = useState(0)
  const [newestStart, setNewestStart] = useState(0)

  const itemsPerView = 4

  return (
    <div className="p-8">
      <div className="mb-12">
        <div className="relative rounded-2xl overflow-hidden h-96">
          <div
            className={`absolute inset-0 bg-linear-to-r ${features[featureIndex].gradient} transition-all duration-500`}
          >
            <img
              src={features[featureIndex].image || "/placeholder.svg"}
              alt={features[featureIndex].title}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-center px-12">
            <h1 className="text-5xl font-bold mb-4 text-white">{features[featureIndex].title}</h1>
            <p className="text-xl text-gray-200 max-w-2xl">{features[featureIndex].description}</p>
          </div>
          <div className="absolute bottom-6 right-6 flex gap-2 z-10">
            <button
              onClick={() => setFeatureIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1))}
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setFeatureIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1))}
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setFeatureIndex(index)}
                className={`w-2 h-2 rounded-full transition ${index === featureIndex ? "bg-white w-8" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTrendingStart(Math.max(0, trendingStart - itemsPerView))}
              disabled={trendingStart === 0}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTrendingStart(Math.min(trending.length - itemsPerView, trendingStart + itemsPerView))}
              disabled={trendingStart >= trending.length - itemsPerView}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {trending.slice(trendingStart, trendingStart + itemsPerView).map((item, index) => (
            <Link
              key={index}
              tof={`/music/${index + 1}`}
              className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
            >
              <div className="relative mb-4">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full aspect-square rounded object-cover"
                />
                <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                  <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                </button>
              </div>
              <h3 className="font-semibold text-white mb-1">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.artist}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Newest</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setNewestStart(Math.max(0, newestStart - itemsPerView))}
              disabled={newestStart === 0}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setNewestStart(Math.min(newest.length - itemsPerView, newestStart + itemsPerView))}
              disabled={newestStart >= newest.length - itemsPerView}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {newest.slice(newestStart, newestStart + itemsPerView).map((item, index) => (
            <Link
              key={index}
              to={`/music/${index + 5}`}
              className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
            >
              <div className="relative mb-4">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full aspect-square rounded object-cover"
                />
                <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                  <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                </button>
              </div>
              <h3 className="font-semibold text-white mb-1">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.artist}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
