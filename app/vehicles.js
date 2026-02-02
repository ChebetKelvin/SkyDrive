const vehiclesData = [
  {
    id: 1,
    name: "Mercedes-Benz S-Class",
    category: "Executive Sedan",
    type: "sedan",
    subType: "luxury_sedan",

    // Visual & Media
    images: [
      "https://i.pinimg.com/1200x/df/ce/d9/dfced9ff31a68e166d991803b91e93e5.jpg",
      "https://i.pinimg.com/736x/0d/60/df/0d60df3201451a6f792aeae30fb147f7.jpg",
      "https://i.pinimg.com/1200x/c5/9e/b0/c59eb0b6f97da18da30af774a80e7ddd.jpg",
      "https://i.pinimg.com/736x/e9/98/6e/e9986ec00b4bd39f5c0d2470438c15ac.jpg",
    ],
    thumbnail: "/s-class.jpg",
    color: "Obsidian Black",
    year: 2024,
    isFeatured: true,

    // Pricing Structure
    pricing: {
      perHour: 12000,
      perDay: 65000,
      perWeek: 380000,
      currency: "KES",
      securityDeposit: 40000,
      includes: [
        "Professional Driver",
        "Fuel",
        "Insurance",
        "Bottled Water",
        "WiFi",
      ],
    },

    // Ratings & Stats
    rating: 4.9,
    totalReviews: 245,
    trips: 1200,
    availability: 92,
    instantConfirmation: true,

    // Capacity & Comfort
    capacity: {
      passengers: 4,
      luggage: 3,
      seats: "Nappa Leather, Massage & Ventilated",
      legroom: "Executive Class",
    },
    dimensions: {
      length: "5.3m",
      width: "1.9m",
      height: "1.5m",
    },

    // Features
    features: [
      "Burmester® 4D Surround Sound",
      "MBUX Hyperscreen",
      "Executive Rear Seat Package",
      "ENERGIZING Comfort Control",
      "Magic Body Control",
      "Digital Light Headlamps",
      "Wireless Charging",
      "Heated & Cooled Cup Holders",
    ],

    // Specifications
    specifications: {
      engine: "3.0L Inline-6 Turbo",
      horsepower: "435 HP",
      torque: "520 Nm",
      transmission: "9G-Tronic Automatic",
      driveType: "4MATIC AWD",
      fuelType: "Petrol Mild Hybrid",
      fuelEconomy: "7.8L/100km",
      topSpeed: "250 km/h",
      acceleration: "0-100 km/h in 4.8s",
    },

    // Safety
    safety: [
      "PRE-SAFE® Impulse Side",
      "Active Distance Assist DISTRONIC",
      "Active Steering Assist",
      "Active Blind Spot Assist",
      "Evasion Assist",
      "10 Airbags",
      "360° Camera System",
    ],

    // Comfort & Tech
    comfort: [
      "Thermotronic 4-Zone Climate",
      "Air Balance System with Fragrance",
      "Ambient Lighting with 64 Colors",
      "Head-Up Display",
      "Gesture Control",
      "Wireless Apple CarPlay/Android Auto",
    ],

    // Service Info
    driverIncluded: true,
    languages: ["English", "Swahili", "German", "French"],
    minBookingHours: 3,
    freeCancellation: "24 hours before pickup",

    // Location
    locations: ["Nairobi", "Mombasa", "Kisumu"],
    baseLocation: {
      city: "Nairobi",
      address: "CBD, Mercedes-Benz Center",
      coordinates: { lat: -1.2921, lng: 36.8219 },
    },

    // Description
    description:
      "The pinnacle of luxury sedans, offering unparalleled comfort and technology for executive travel across African cities.",

    // Tags & Metadata
    tags: ["Executive", "Luxury", "Sedan", "Business", "Airport Transfer"],
    status: "available",
    lastMaintenance: "2024-01-20",
    nextAvailable: "2024-01-25 08:00",

    // Host Info
    host: {
      name: "SkyDrive Executive Fleet",
      rating: 4.9,
      joined: "2019",
      verified: true,
      responseRate: "98%",
    },

    // Booking Rules
    bookingRules: {
      minAge: 25,
      licenseRequired: true,
      smokingAllowed: false,
      petsAllowed: false,
      mileageLimit: "300km/day included",
      crossBorderAllowed: true,
    },

    // Insurance
    insurance: {
      included: true,
      coverage: "Comprehensive + Passenger Liability",
      excess: "KES 40,000",
      additionalDrivers: 1,
    },

    // Add-ons
    addons: [
      { name: "Airport Fast Track", price: 3000, per: "trip" },
      { name: "Executive Refreshments", price: 5000, per: "day" },
      { name: "Multilingual Guide", price: 2000, per: "hour" },
      { name: "Mobile Office Setup", price: 2500, per: "day" },
    ],
  },
  {
    id: 2,
    name: "Range Rover Autobiography",
    category: "Luxury SUV",
    type: "suv",
    subType: "luxury_suv",

    images: [
      "https://i.pinimg.com/1200x/80/53/19/805319b4b5bb2e3ee2833a4877962b1d.jpg",
      "https://i.pinimg.com/1200x/e9/4f/5e/e94f5e6d51db77a2efe41a02d1094f2a.jpg",
      "https://i.pinimg.com/736x/c1/04/c8/c104c893ec9ce552980dff488fc3c30f.jpg",
      "https://i.pinimg.com/1200x/68/b7/f1/68b7f192d132bb2dca9c60b52bbe511d.jpg",
    ],
    thumbnail: "/range-rover.jpg",
    color: "Eiger Grey",
    year: 2024,
    isFeatured: true,

    pricing: {
      perHour: 15000,
      perDay: 85000,
      perWeek: 500000,
      currency: "KES",
      securityDeposit: 50000,
      includes: [
        "Safari Guide",
        "Fuel",
        "Full Insurance",
        "Refreshments",
        "First Aid Kit",
      ],
    },

    rating: 4.8,
    totalReviews: 127,
    trips: 850,
    availability: 95,
    instantConfirmation: true,

    capacity: {
      passengers: 7,
      luggage: 4,
      seats: "Semi-Aniline Leather, Heated & Ventilated",
      legroom: "Spacious Three Rows",
    },
    dimensions: {
      length: "5.2m",
      width: "2.2m",
      height: "1.8m",
    },

    features: [
      "Terrain Response® 2 System",
      "Panoramic Sky Roof",
      "Meridian™ Signature Sound System",
      "ClearSight Ground View",
      "Adaptive Dynamics",
      "Configurable Ambient Lighting",
      "Activity Key (Waterproof Wearable)",
      "Advanced Tow Assist",
    ],

    specifications: {
      engine: "4.4L V8 Supercharged",
      horsepower: "523 HP",
      torque: "750 Nm",
      transmission: "8-Speed Automatic",
      driveType: "All-Wheel Drive",
      fuelType: "Petrol Mild Hybrid",
      fuelEconomy: "10.2L/100km",
      topSpeed: "250 km/h",
      acceleration: "0-100 km/h in 4.6s",
      wadingDepth: "900mm",
    },

    safety: [
      "Emergency Braking",
      "Lane Keep Assist",
      "Blind Spot Assist",
      "Rear Collision Monitor",
      "Driver Condition Monitor",
      "8 Airbags",
      "ClearSight Rear View Mirror",
    ],

    comfort: [
      "4-Zone Climate Control",
      "Head-Up Display",
      "Touch Pro Duo Displays",
      "Cooled & Heated Front Seats",
      "Activity Pack with Tablets",
      "WiFi Hotspot (4G)",
    ],

    driverIncluded: true,
    languages: ["English", "Swahili", "Maasai", "French"],
    minBookingHours: 4,
    freeCancellation: "48 hours for safaris",

    locations: ["Nairobi", "Mombasa", "Nakuru", "Masai Mara"],
    baseLocation: {
      city: "Nairobi",
      address: "Westlands, SkyDrive Safari Base",
      coordinates: { lat: -1.2667, lng: 36.8 },
    },

    description:
      "Ultimate luxury SUV combining opulent comfort with legendary off-road capability. Perfect for safari adventures and executive travel.",

    tags: ["Luxury", "SUV", "4x4", "Safari", "Family", "Adventure"],
    status: "available",
    lastMaintenance: "2024-01-15",
    nextAvailable: "2024-01-20 09:00",

    host: {
      name: "SkyDrive Safari Division",
      rating: 4.9,
      joined: "2020",
      verified: true,
      responseRate: "99%",
    },

    bookingRules: {
      minAge: 25,
      licenseRequired: true,
      smokingAllowed: false,
      petsAllowed: true,
      mileageLimit: "Unlimited for safaris",
      crossBorderAllowed: true,
      offRoadCapable: true,
    },

    insurance: {
      included: true,
      coverage: "Comprehensive + Off-road Coverage",
      excess: "KES 50,000",
      additionalDrivers: 2,
    },

    addons: [
      { name: "Professional Safari Guide", price: 5000, per: "hour" },
      { name: "Safari Equipment Rental", price: 15000, per: "trip" },
      { name: "Satellite Phone", price: 3000, per: "day" },
      { name: "Camping Setup", price: 25000, per: "trip" },
      { name: "Wildlife Photographer", price: 8000, per: "hour" },
    ],
  },
  {
    id: 3,
    name: "Toyota Land Cruiser VX",
    category: "Premium Safari Vehicle",
    type: "suv",
    subType: "safari_vehicle",

    images: [
      "https://i.pinimg.com/736x/de/0b/4e/de0b4ef283c05ee4c15cc0906d0b2cab.jpg",
      "https://i.pinimg.com/1200x/87/49/de/8749ded968049bfbfd0181d6c5419adc.jpg",
      "https://i.pinimg.com/1200x/ad/b7/b5/adb7b5bf2f90bcfdfb8774c24e0c07a4.jpg",
      "https://i.pinimg.com/1200x/07/9a/28/079a2881e106cdc381f4f51b9dfdf3fb.jpg",
    ],
    thumbnail: "/landcruiser.jpg",
    color: "Pearl White",
    year: 2023,
    isFeatured: false,

    pricing: {
      perHour: 9000,
      perDay: 50000,
      perWeek: 280000,
      currency: "KES",
      securityDeposit: 30000,
      includes: ["Safari Guide", "Fuel", "Park Fees", "Water", "Binoculars"],
    },

    rating: 4.9,
    totalReviews: 312,
    trips: 2100,
    availability: 88,
    instantConfirmation: true,

    capacity: {
      passengers: 7,
      luggage: 5,
      seats: "Premium Fabric, Pop-up Roof",
      legroom: "Extended Safari Configuration",
    },
    dimensions: {
      length: "5.0m",
      width: "2.0m",
      height: "1.9m",
    },

    features: [
      "KDSS (Kinetic Dynamic Suspension)",
      "Multi-Terrain Select",
      "Crawl Control",
      "Panoramic View Monitor",
      "Cool Box (15L)",
      "Safari Pop-up Roof",
      "Bull Bar & Spotlights",
      "Dual Battery System",
    ],

    specifications: {
      engine: "4.5L V8 Twin Turbo Diesel",
      horsepower: "268 HP",
      torque: "650 Nm",
      transmission: "6-Speed Automatic",
      driveType: "Full-Time 4WD",
      fuelType: "Diesel",
      fuelEconomy: "9.5L/100km",
      topSpeed: "210 km/h",
      acceleration: "0-100 km/h in 7.7s",
      wadingDepth: "700mm",
    },

    safety: [
      "Multi-Terrain ABS",
      "Vehicle Stability Control",
      "Hill Start Assist",
      "Downhill Assist Control",
      "8 Airbags",
      "Tire Pressure Monitor",
      "First Aid & Fire Extinguisher",
    ],

    comfort: [
      "4-Zone Climate Control",
      "Cooled Center Console",
      "JBL Premium Sound",
      "Wireless Charging",
      "Rear Seat Entertainment",
      "Sunroof",
    ],

    driverIncluded: true,
    languages: ["English", "Swahili", "Local Dialects"],
    minBookingHours: 8,
    freeCancellation: "72 hours for safaris",

    locations: ["All National Parks", "Nairobi", "Mombasa"],
    baseLocation: {
      city: "Nairobi",
      address: "Karen, Safari Fleet Base",
      coordinates: { lat: -1.3192, lng: 36.711 },
    },

    description:
      "The legendary safari workhorse. Proven reliability, exceptional off-road capability, and comfort for extended wildlife viewing.",

    tags: ["Safari", "4x4", "Adventure", "Wildlife", "Reliable", "Tour"],
    status: "available",
    lastMaintenance: "2024-01-10",
    nextAvailable: "2024-01-18 06:00",

    host: {
      name: "SkyDrive Safari Specialists",
      rating: 4.9,
      joined: "2018",
      verified: true,
      responseRate: "100%",
    },

    bookingRules: {
      minAge: 23,
      licenseRequired: false,
      smokingAllowed: false,
      petsAllowed: false,
      mileageLimit: "Unlimited",
      crossBorderAllowed: true,
      offRoadOnly: true,
    },

    insurance: {
      included: true,
      coverage: "Comprehensive + Park Liability",
      excess: "KES 30,000",
      additionalDrivers: 0,
    },

    addons: [
      { name: "Professional Wildlife Guide", price: 4000, per: "hour" },
      { name: "Camera Equipment Rental", price: 10000, per: "day" },
      { name: "Safari Lunch Package", price: 3000, per: "person" },
      { name: "Night Safari Equipment", price: 8000, per: "trip" },
    ],
  },
  {
    id: 4,
    name: "BMW 7 Series",
    category: "Executive Sedan",
    type: "sedan",
    subType: "executive_sedan",

    images: [
      "https://i.pinimg.com/1200x/1f/ae/a4/1faea4e399c772e16b3ec853cc704c67.jpg",
      "https://i.pinimg.com/736x/df/94/36/df9436cf7313c0bc89857ae98b70f21c.jpg",
      "https://i.pinimg.com/736x/f0/c9/58/f0c958cb5dc78f78ef55654f3954a6f9.jpg",
      "https://i.pinimg.com/736x/02/bd/a6/02bda6473e71e84753d647a7a24ea8bb.jpg",
    ],
    thumbnail: "/bmw-7.jpg",
    color: "Mineral White",
    year: 2024,
    isFeatured: false,

    pricing: {
      perHour: 13500,
      perDay: 72000,
      perWeek: 420000,
      currency: "KES",
      securityDeposit: 45000,
      includes: ["Executive Driver", "Fuel", "Insurance", "Newspapers"],
    },

    rating: 4.7,
    totalReviews: 189,
    trips: 950,
    availability: 90,
    instantConfirmation: true,

    capacity: {
      passengers: 5,
      luggage: 3,
      seats: "Merino Leather, Executive Lounger",
      legroom: "Theater Configuration",
    },
    dimensions: {
      length: "5.4m",
      width: "2.0m",
      height: "1.5m",
    },

    features: [
      "BMW Theater Screen",
      "Executive Lounge Seating",
      "Bowers & Wilkins Diamond Sound",
      "BMW Interaction Bar",
      "Sky Lounge Panoramic Roof",
      "Gesture Control 2.0",
      "Remote Parking",
      "BMW Digital Key Plus",
    ],

    specifications: {
      engine: "3.0L Inline-6 Mild Hybrid",
      horsepower: "380 HP",
      torque: "540 Nm",
      transmission: "8-Speed Steptronic",
      driveType: "xDrive AWD",
      fuelType: "Petrol",
      fuelEconomy: "7.9L/100km",
      topSpeed: "250 km/h",
      acceleration: "0-100 km/h in 5.1s",
    },

    safety: [
      "Driving Assistant Professional",
      "Parking Assistant Plus",
      "Active Protection",
      "Surround View with 3D View",
      "Cross Traffic Alert",
      "10 Airbags",
      "Active Lane Change Assistant",
    ],

    comfort: [
      "4-Zone Automatic Climate",
      "Massage Function for All Seats",
      "Ambient Air Package",
      "Executive Lounge Console",
      "Rear Seat Entertainment",
      "Wireless Charging Tray",
    ],

    driverIncluded: true,
    languages: ["English", "Swahili", "German", "Arabic"],
    minBookingHours: 3,
    freeCancellation: "24 hours before",

    locations: ["Nairobi", "Mombasa", "Kigali"],
    baseLocation: {
      city: "Nairobi",
      address: "Upper Hill, BMW Center",
      coordinates: { lat: -1.3, lng: 36.8 },
    },

    description:
      "Ultimate business class on wheels. The BMW 7 Series redefines luxury mobility with cutting-edge technology and supreme comfort.",

    tags: ["Executive", "Luxury", "Business", "Technology", "Airport"],
    status: "available",
    lastMaintenance: "2024-01-12",
    nextAvailable: "2024-01-22 10:00",

    host: {
      name: "SkyDrive Corporate Fleet",
      rating: 4.8,
      joined: "2021",
      verified: true,
      responseRate: "97%",
    },

    bookingRules: {
      minAge: 25,
      licenseRequired: true,
      smokingAllowed: false,
      petsAllowed: false,
      mileageLimit: "250km/day included",
      crossBorderAllowed: true,
    },

    insurance: {
      included: true,
      coverage: "Comprehensive + Business Travel",
      excess: "KES 45,000",
      additionalDrivers: 1,
    },

    addons: [
      { name: "Executive Meeting Setup", price: 8000, per: "day" },
      { name: "Multilingual Corporate Guide", price: 3000, per: "hour" },
      { name: "Document Security Case", price: 2000, per: "trip" },
      { name: "Premium Refreshment Package", price: 6000, per: "day" },
    ],
  },
  {
    id: 5,
    name: "Audi Q8",
    category: "Luxury SUV",
    type: "suv",
    subType: "coupe_suv",

    images: [
      "https://i.pinimg.com/1200x/75/0d/2b/750d2b4950993b58cd2e740a228030ff.jpg",
      "https://i.pinimg.com/736x/bb/f5/0f/bbf50fe6ce2f1d10c16d9842e208b9f0.jpg",
      "https://i.pinimg.com/736x/86/96/e2/8696e2b968b06b9426fbd136c26c7a48.jpg",
      "https://i.pinimg.com/1200x/31/1f/bb/311fbbbb6207f62737679d47f243e8b0.jpg",
    ],
    thumbnail: "/audi-q8.jpg",
    color: "Navarra Blue",
    year: 2023,
    isFeatured: true,

    pricing: {
      perHour: 14000,
      perDay: 75000,
      perWeek: 440000,
      currency: "KES",
      securityDeposit: 40000,
      includes: ["Driver", "Fuel", "Insurance", "WiFi"],
    },

    rating: 4.8,
    totalReviews: 156,
    trips: 720,
    availability: 85,
    instantConfirmation: true,

    capacity: {
      passengers: 5,
      luggage: 3,
      seats: "Valcona Leather, Sport Seats",
      legroom: "Coupe-Style Spacious",
    },
    dimensions: {
      length: "5.0m",
      width: "2.0m",
      height: "1.7m",
    },

    features: [
      "quattro with Ultra Technology",
      "HD Matrix LED Headlights",
      "Bang & Olufsen 3D Sound",
      "Virtual Cockpit Plus",
      "Sport Differential",
      "All-wheel Steering",
      "Phone Box with Signal Boost",
      "Head-up Display",
    ],

    specifications: {
      engine: "3.0L V6 TFSI",
      horsepower: "340 HP",
      torque: "500 Nm",
      transmission: "8-speed Tiptronic",
      driveType: "quattro AWD",
      fuelType: "Petrol Mild Hybrid",
      fuelEconomy: "8.5L/100km",
      topSpeed: "250 km/h",
      acceleration: "0-100 km/h in 5.9s",
    },

    safety: [
      "Audi Pre Sense City",
      "Adaptive Cruise Assist",
      "Cross Traffic Assist Rear",
      "Exit Warning",
      "Collision Avoidance Assist",
      "8 Airbags",
      "360° Camera System",
    ],

    comfort: [
      "4-Zone Climate Control",
      "Contour Ambient Lighting",
      "Massage Front Seats",
      "Acoustic Glazing",
      "Air Quality Package",
      "Heated Steering Wheel",
    ],

    driverIncluded: true,
    languages: ["English", "Swahili", "German"],
    minBookingHours: 4,
    freeCancellation: "24 hours before",

    locations: ["Nairobi", "Mombasa", "Dar es Salaam"],
    baseLocation: {
      city: "Nairobi",
      address: "Lavington, Audi Center",
      coordinates: { lat: -1.2833, lng: 36.7667 },
    },

    description:
      "The sportiest luxury SUV in the skyDrive fleet. Combining coupe elegance with SUV versatility for style-conscious travelers.",

    tags: ["Luxury", "SUV", "Sport", "Style", "Urban", "Family"],
    status: "available",
    lastMaintenance: "2024-01-18",
    nextAvailable: "2024-01-23 14:00",

    host: {
      name: "SkyDrive Premium SUVs",
      rating: 4.8,
      joined: "2022",
      verified: true,
      responseRate: "96%",
    },

    bookingRules: {
      minAge: 25,
      licenseRequired: true,
      smokingAllowed: false,
      petsAllowed: true,
      mileageLimit: "300km/day included",
      crossBorderAllowed: true,
    },

    insurance: {
      included: true,
      coverage: "Comprehensive",
      excess: "KES 40,000",
      additionalDrivers: 1,
    },

    addons: [
      { name: "Sport Package", price: 5000, per: "day" },
      { name: "Night Vision Camera", price: 3000, per: "trip" },
      { name: "Pet Travel Kit", price: 2000, per: "trip" },
      { name: "Valet Parking Service", price: 4000, per: "day" },
    ],
  },
  {
    id: 6,
    name: "Bell 407 GXi",
    category: "Executive Helicopter",
    type: "helicopter",
    subType: "executive_helicopter",

    images: [
      "https://i.pinimg.com/1200x/26/eb/13/26eb13d785c2c1a95b41afe201bf6870.jpg",
      "https://i.pinimg.com/736x/b0/c9/7c/b0c97c012542a397ae7491c894c30791.jpg",
      "https://i.pinimg.com/1200x/e0/63/f2/e063f27303a927ab68e023584e061dcc.jpg",
      "https://i.pinimg.com/736x/7c/f6/43/7cf643fa41f2927b73a4d164f5621825.jpg",
    ],
    thumbnail: "/bell-407.jpg",
    color: "SkyDrive Blue & Gold",
    year: 2022,
    isFeatured: true,

    pricing: {
      perHour: 180000,
      perDay: 950000,
      perWeek: 5200000,
      currency: "KES",
      securityDeposit: 200000,
      includes: ["Pilot", "Fuel", "Insurance", "ATC Fees", "Ground Handler"],
    },

    rating: 4.9,
    totalReviews: 89,
    trips: 450,
    availability: 75,
    instantConfirmation: true,

    capacity: {
      passengers: 6,
      luggage: 100, // kg
      seats: "Executive Leather, VIP Configuration",
      legroom: "Standing Height Cabin",
    },
    dimensions: {
      length: "12.7m",
      width: "2.0m",
      height: "3.2m",
      rotorDiameter: "10.7m",
    },

    features: [
      "Garmin G1000H Avionics",
      "Noise Reduction System",
      "Executive VIP Interior",
      "Wireless Entertainment System",
      "Climate Control System",
      "In-flight WiFi",
      "Privacy Partition",
      "Refreshment Center",
    ],

    specifications: {
      engine: "Rolls-Royce 250-C47B",
      horsepower: "813 SHP",
      torque: "N/A",
      transmission: "2-Stage Planetary",
      fuelType: "Jet A-1",
      fuelCapacity: "1,069L",
      cruiseSpeed: "245 km/h",
      maxSpeed: "260 km/h",
      range: "700 km",
      serviceCeiling: "6,100m",
      hoverCeiling: "3,400m",
    },

    safety: [
      "Health Usage Monitoring System",
      "Crashworthy Fuel System",
      "Emergency Floats",
      "Traffic Collision Avoidance",
      "Terrain Awareness Warning",
      "Dual Pilot Capable",
      "Night Vision Goggle Compatible",
    ],

    comfort: [
      "Executive Club Seating",
      "Custom Sound System",
      "Refreshment Bar",
      "Privacy Divider",
      "Large Viewing Windows",
      "Cabin Attendant Service",
    ],

    pilotIncluded: true,
    copilotAvailable: true,
    languages: ["English", "Swahili", "French", "Arabic"],
    minBookingHours: 1,
    freeCancellation: "48 hours before",

    locations: ["All Major Airports", "Nairobi", "Mombasa"],
    baseLocation: {
      city: "Nairobi",
      airport: "Wilson Airport (HKNW)",
      coordinates: { lat: -1.3217, lng: 36.8147 },
    },

    description:
      "Africa's premier executive helicopter. Fast, comfortable, and versatile for business travel, aerial tours, and VIP transport.",

    tags: ["Helicopter", "VIP", "Executive", "Aerial", "Fast", "Luxury"],
    status: "available",
    lastMaintenance: "2024-01-05",
    nextAvailable: "2024-01-21 07:00",

    host: {
      name: "SkyDrive Aviation Division",
      rating: 4.9,
      joined: "2020",
      verified: true,
      responseRate: "95%",
    },

    bookingRules: {
      minAge: 18,
      licenseRequired: false,
      smokingAllowed: false,
      petsAllowed: false,
      baggageLimit: "20kg per passenger",
      flightPlanning: "Required 24h advance",
      weatherDependent: true,
    },

    insurance: {
      included: true,
      coverage: "Aviation Comprehensive",
      excess: "KES 100,000",
      passengerLiability: "USD 100M",
    },

    addons: [
      { name: "Aerial Photography Package", price: 25000, per: "hour" },
      { name: "VIP Ground Transfer", price: 15000, per: "trip" },
      { name: "Custom Route Planning", price: 20000, fixed: true },
      { name: "In-flight Catering", price: 8000, per: "person" },
      { name: "Flight Certificate", price: 5000, fixed: true },
    ],

    flightConfigurations: [
      {
        name: "Executive Transport",
        seats: 6,
        description: "VIP cabin configuration",
      },
      {
        name: "Aerial Safari",
        seats: 5,
        description: "Large windows for photography",
      },
      {
        name: "Medical Evacuation",
        seats: 2,
        description: "Medevac configuration",
      },
    ],
  },
  {
    id: 7,
    name: "Airbus H125",
    category: "Aerial Safari",
    type: "helicopter",
    subType: "safari_helicopter",

    images: [
      "https://i.pinimg.com/1200x/f0/5c/75/f05c75ad3ada8358d4594e93e3739ff7.jpg",
      "https://i.pinimg.com/1200x/bf/c2/35/bfc235938669fabb741456695c4d80f7.jpg",
      "https://i.pinimg.com/736x/53/07/2f/53072ffde9b253e1a93310c76dbea46b.jpg",
      "https://i.pinimg.com/736x/18/d4/ec/18d4ec9e9bf17316941312bb711f86cf.jpg",
    ],
    thumbnail: "/H125.jpg",
    color: "Safari Camo & Orange",
    year: 2021,
    isFeatured: true,

    pricing: {
      perHour: 150000,
      perDay: 800000,
      perWeek: 4500000,
      currency: "KES",
      securityDeposit: 150000,
      includes: ["Pilot Guide", "Fuel", "Park Fees", "Photography Guidance"],
    },

    rating: 4.8,
    totalReviews: 67,
    trips: 320,
    availability: 80,
    instantConfirmation: true,

    capacity: {
      passengers: 5,
      luggage: 80, // kg
      seats: "High Visibility, Photography Ready",
      legroom: "Bubble Windows for Viewing",
    },
    dimensions: {
      length: "12.9m",
      width: "2.5m",
      height: "3.3m",
      rotorDiameter: "10.7m",
    },

    features: [
      "High Altitude Kit",
      "Bubble Windows",
      "External Camera Mounts",
      "Float Landing Gear",
      "Enhanced Vision System",
      "Wildlife Spotting Lights",
      "GPS Animal Tracking",
      "In-flight PA System",
    ],

    specifications: {
      engine: "Safran Arriel 2D",
      horsepower: "952 SHP",
      fuelType: "Jet A-1",
      fuelCapacity: "1,200L",
      cruiseSpeed: "240 km/h",
      maxSpeed: "287 km/h",
      range: "800 km",
      serviceCeiling: "7,000m",
      hoverCeiling: "4,600m",
      hotDayPerformance: "Excellent",
    },

    safety: [
      "Helionix Avionics",
      "4-Axis Autopilot",
      "Emergency Flotation",
      "Wire Strike Protection",
      "Health Usage Monitoring",
      "Satellite Tracking",
      "Survival Equipment",
    ],

    comfort: [
      "Air Conditioning",
      "Noise Attenuating Headset",
      "Large Viewing Ports",
      "Camera Stabilization",
      "Refreshment Cooler",
      "Safari Guide Communication",
    ],

    pilotIncluded: true,
    safariGuide: true,
    languages: ["English", "Swahili", "Maasai", "Photography Terms"],
    minBookingHours: 2,
    freeCancellation: "72 hours for weather",

    locations: ["All National Parks", "Coastal Regions", "Mountain Areas"],
    baseLocation: {
      city: "Nairobi",
      airport: "Wilson Airport (HKNW)",
      coordinates: { lat: -1.3217, lng: 36.8147 },
    },

    description:
      "Specialized safari helicopter with exceptional high-altitude performance and panoramic views for unforgettable wildlife experiences.",

    tags: [
      "Helicopter",
      "Safari",
      "Wildlife",
      "Photography",
      "Adventure",
      "Scenic",
    ],
    status: "available",
    lastMaintenance: "2024-01-08",
    nextAvailable: "2024-01-19 06:30",

    host: {
      name: "SkyDrive Safari Aviation",
      rating: 4.9,
      joined: "2019",
      verified: true,
      responseRate: "94%",
    },

    bookingRules: {
      minAge: 12,
      licenseRequired: false,
      smokingAllowed: false,
      petsAllowed: false,
      baggageLimit: "15kg + camera gear",
      flightPlanning: "Required 48h advance",
      weatherDependent: true,
      parkPermissions: "Included",
    },

    insurance: {
      included: true,
      coverage: "Aviation + Safari Liability",
      excess: "KES 80,000",
      passengerLiability: "USD 50M",
    },

    addons: [
      { name: "Professional Photographer", price: 15000, per: "hour" },
      { name: "4K Video Recording", price: 20000, per: "flight" },
      { name: "Sunrise/Sunset Flight", price: 25000, premium: true },
      { name: "Custom Safari Route", price: 30000, fixed: true },
      { name: "Wildlife Spotting Package", price: 10000, per: "flight" },
    ],

    safariPackages: [
      { name: "Great Migration", duration: "3 hours", price: 450000 },
      { name: "Mountain Gorillas", duration: "6 hours", price: 900000 },
      { name: "Coastal Tour", duration: "2 hours", price: 300000 },
    ],
  },
  {
    id: 8,
    name: "Porsche Panamera",
    category: "Sports Luxury",
    type: "sedan",
    subType: "sports_sedan",

    images: [
      "https://i.pinimg.com/1200x/6a/26/33/6a263307e447b0021a812c6f18736ecb.jpg",
      "https://i.pinimg.com/1200x/7c/b4/97/7cb4973f8c09d713ac3f64fed57a4e0a.jpg",
      "https://i.pinimg.com/1200x/14/9c/76/149c769c7740c91f586ba269920d3f63.jpg",
      "https://i.pinimg.com/1200x/8e/1d/80/8e1d80211e9d08697120db30d8b4dc2c.jpg",
    ],
    thumbnail:
      "https://i.pinimg.com/1200x/6a/26/33/6a263307e447b0021a812c6f18736ecb.jpg",
    color: "Carmine Red",
    year: 2023,
    isFeatured: false,

    pricing: {
      perHour: 16000,
      perDay: 85000,
      perWeek: 480000,
      currency: "KES",
      securityDeposit: 60000,
      includes: ["Professional Driver", "Fuel", "Insurance", "Track Access*"],
    },

    rating: 4.9,
    totalReviews: 92,
    trips: 580,
    availability: 70,
    instantConfirmation: true,

    capacity: {
      passengers: 4,
      luggage: 2,
      seats: "Race-Tex & Leather, Sport Seats",
      legroom: "2+2 Sports Configuration",
    },
    dimensions: {
      length: "5.0m",
      width: "1.9m",
      height: "1.4m",
    },

    features: [
      "Porsche Active Suspension",
      "Sport Chrono Package",
      "Porsche Ceramic Composite Brakes",
      "PDK Dual-Clutch Transmission",
      "Porsche Torque Vectoring Plus",
      "Sport Exhaust System",
      "Launch Control",
      "Porsche Communication Management",
    ],

    specifications: {
      engine: "2.9L V6 Twin Turbo",
      horsepower: "440 HP",
      torque: "550 Nm",
      transmission: "8-Speed PDK",
      driveType: "All-Wheel Drive",
      fuelType: "Petrol",
      fuelEconomy: "9.2L/100km",
      topSpeed: "289 km/h",
      acceleration: "0-100 km/h in 4.1s",
    },

    safety: [
      "Porsche Stability Management",
      "Wet Mode",
      "Night Vision Assist",
      "Lane Change Assist",
      "ParkAssist with Surround View",
      "8 Airbags",
      "Fire Extinguisher",
    ],

    comfort: [
      "4-Zone Climate Control",
      "Massage Seats Front",
      "Burmester® 3D Sound",
      "Ambient Lighting",
      "Heated Steering Wheel",
      "Ventilated Seats",
    ],

    driverIncluded: true,
    languages: ["English", "Swahili", "German", "Italian"],
    minBookingHours: 2,
    freeCancellation: "24 hours before",

    locations: ["Nairobi", "Mombasa Coast Road", "Track Events"],
    baseLocation: {
      city: "Nairobi",
      address: "Karen, Porsche Center",
      coordinates: { lat: -1.3192, lng: 36.711 },
    },

    description:
      "The ultimate sports luxury sedan. Experience breathtaking performance wrapped in exquisite luxury for special occasions and thrilling drives.",

    tags: [
      "Sports",
      "Luxury",
      "Performance",
      "Special Occasion",
      "Fast",
      "Prestige",
    ],
    status: "available",
    lastMaintenance: "2024-01-14",
    nextAvailable: "2024-01-24 11:00",

    host: {
      name: "SkyDrive Performance Division",
      rating: 4.9,
      joined: "2022",
      verified: true,
      responseRate: "98%",
    },

    bookingRules: {
      minAge: 30,
      licenseRequired: true,
      smokingAllowed: false,
      petsAllowed: false,
      mileageLimit: "200km/day included",
      crossBorderAllowed: false,
      trackAccess: "Available on request",
    },

    insurance: {
      included: true,
      coverage: "Comprehensive + Track Insurance",
      excess: "KES 75,000",
      additionalDrivers: 0,
    },

    addons: [
      { name: "Professional Driving Instructor", price: 8000, per: "hour" },
      { name: "Track Day Access", price: 50000, per: "day" },
      { name: "Performance Data Logger", price: 10000, per: "session" },
      { name: "VIP Event Drop-off", price: 20000, premium: true },
    ],

    performanceModes: ["Normal", "Sport", "Sport Plus", "Individual"],
  },
];

export default vehiclesData;
