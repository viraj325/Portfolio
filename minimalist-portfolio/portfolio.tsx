import Image from "next/image"
import { ThemeToggle } from "./components/theme-toggle"
import { Mail, Github, Linkedin, Twitter, Phone, MapPin } from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen relative font-['Inter',sans-serif]">
      <div className="absolute inset-0 bg-gradient-radial from-amber-100/40 via-amber-50/20 via-amber-25/10 to-white dark:from-amber-900/15 dark:via-amber-950/8 dark:via-gray-900/12 dark:to-gray-950 animate-gradient-pulse"></div>
      <ThemeToggle />
      <div className="relative z-10">
        <div className="max-w-2xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <div className="text-center mb-24">
            <div className="relative inline-block mb-10">
              <Image
                src="/placeholder.svg?height=200&width=200"
                alt="Profile"
                width={200}
                height={200}
                className="rounded-full shadow-2xl dark:shadow-amber-900/20"
              />
            </div>
            <h1 className="text-5xl font-extralight text-gray-900 dark:text-gray-100 mb-6 tracking-tight leading-tight">
              Alex Johnson
            </h1>
            <p className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-wide">
              <span className="text-amber-600 dark:text-amber-400">Creative</span> Developer
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed tracking-wide font-light">
              Crafting digital experiences with passion and precision
            </p>
          </div>

          {/* About Section */}
          <section className="mb-24">
            <h2 className="text-3xl font-extralight text-gray-900 dark:text-gray-100 mb-8 tracking-wide">
              <span className="text-amber-600 dark:text-amber-400">About</span>
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-light tracking-wide">
              I'm a passionate developer with over 5 years of experience creating
              <span className="text-amber-600 dark:text-amber-400"> beautiful</span> and
              <span className="text-amber-600 dark:text-amber-400"> functional</span> digital solutions. I specialize in
              modern web technologies and user-centered design.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-light tracking-wide">
              When I'm not coding, you'll find me exploring new technologies, contributing to open source projects, or
              enjoying a good cup of coffee.
            </p>
          </section>

          {/* Work Experience Section */}
          <section className="mb-24">
            <h2 className="text-3xl font-extralight text-gray-900 dark:text-gray-100 mb-12 tracking-wide">
              <span className="text-amber-600 dark:text-amber-400">Work</span> Experience
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

              <div className="space-y-12">
                {[
                  {
                    period: "2022 - Present",
                    title: "Senior Frontend Developer",
                    company: "TechFlow Inc.",
                    description:
                      "Leading the development of next-generation web applications using React and TypeScript. Mentoring junior developers and establishing best practices for the frontend team.",
                    achievements: [
                      "Improved app performance by 40%",
                      "Led team of 5 developers",
                      "Implemented design system",
                    ],
                  },
                  {
                    period: "2020 - 2022",
                    title: "Full Stack Developer",
                    company: "Digital Solutions Co.",
                    description:
                      "Built scalable web applications from concept to deployment. Collaborated with designers and product managers to deliver user-centered solutions.",
                    achievements: [
                      "Launched 3 major products",
                      "Reduced load times by 60%",
                      "Integrated payment systems",
                    ],
                  },
                  {
                    period: "2019 - 2020",
                    title: "Frontend Developer",
                    company: "StartupXYZ",
                    description:
                      "Developed responsive web interfaces and mobile applications. Worked in an agile environment with rapid iteration cycles.",
                    achievements: ["Built MVP in 3 months", "Implemented responsive design", "Optimized for mobile"],
                  },
                  {
                    period: "2018 - 2019",
                    title: "Junior Developer",
                    company: "WebCraft Agency",
                    description:
                      "Started my professional journey building websites and learning modern development practices. Gained experience in various technologies and frameworks.",
                    achievements: ["Completed 20+ projects", "Learned React & Node.js", "Client satisfaction 95%"],
                  },
                ].map((job, index) => (
                  <div key={index} className="relative pl-16 group cursor-pointer">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 w-4 h-4 bg-amber-600 dark:bg-amber-400 rounded-full border-4 border-white dark:border-gray-950 group-hover:scale-125 group-hover:bg-amber-500 dark:group-hover:bg-amber-300 transition-all duration-300 shadow-lg"></div>

                    {/* Content */}
                    <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 group-hover:bg-white/80 dark:group-hover:bg-gray-900/50 group-hover:border-amber-200 dark:group-hover:border-amber-800 group-hover:shadow-lg group-hover:shadow-amber-100/50 dark:group-hover:shadow-amber-900/20 transition-all duration-300 group-hover:-translate-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                        <h3 className="text-xl font-light text-gray-900 dark:text-gray-100 tracking-wide group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                          {job.title}
                        </h3>
                        <span className="text-sm text-amber-600 dark:text-amber-400 font-light tracking-wide">
                          {job.period}
                        </span>
                      </div>

                      <h4 className="text-lg text-gray-700 dark:text-gray-300 font-light mb-3 tracking-wide">
                        {job.company}
                      </h4>

                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 font-light tracking-wide">
                        {job.description}
                      </p>

                      <div className="space-y-2">
                        {job.achievements.map((achievement, achievementIndex) => (
                          <div key={achievementIndex} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mr-3 flex-shrink-0"></span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-light tracking-wide">
                              {achievement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section className="mb-24">
            <h2 className="text-3xl font-extralight text-gray-900 dark:text-gray-100 mb-8 tracking-wide">
              <span className="text-amber-600 dark:text-amber-400">Skills</span>
            </h2>
            <div className="space-y-3">
              {[
                "React & Next.js",
                "TypeScript & JavaScript",
                "Node.js & Express",
                "Python & Django",
                "Design Systems & UI/UX",
                "Database Design & Management",
                "Cloud Architecture & DevOps",
                "Mobile Development",
              ].map((skill, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full mr-4 flex-shrink-0"></span>
                  <span className="text-lg text-gray-700 dark:text-gray-300 font-light tracking-wide">{skill}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section className="mb-24">
            <h2 className="text-3xl font-extralight text-gray-900 dark:text-gray-100 mb-8 tracking-wide">
              <span className="text-amber-600 dark:text-amber-400">Selected</span> Work
            </h2>
            <div className="space-y-10">
              {[
                {
                  title: "E-commerce Platform",
                  description: "A modern e-commerce solution built with Next.js and Stripe integration.",
                  tech: "Next.js, TypeScript, Stripe",
                },
                {
                  title: "Design System",
                  description: "Comprehensive design system for a fintech startup with 50+ components.",
                  tech: "React, Storybook, Figma",
                },
                {
                  title: "Mobile App",
                  description: "Cross-platform mobile application for task management and productivity.",
                  tech: "React Native, Firebase",
                },
              ].map((project, index) => (
                <div key={index} className="border-b border-gray-100 dark:border-gray-800 pb-8 last:border-b-0">
                  <h3 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-wide">
                    {project.title}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-3 leading-relaxed font-light tracking-wide">
                    {project.description}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 font-light tracking-wide">{project.tech}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Methods Section */}
          <section className="mb-24">
            <h2 className="text-3xl font-extralight text-gray-900 dark:text-gray-100 mb-8 tracking-wide">
              <span className="text-amber-600 dark:text-amber-400">Get</span> in Touch
            </h2>
            <div className="space-y-6">
              <a
                href="mailto:alex@example.com"
                className="flex items-center group hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300"
              >
                <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-4 flex-shrink-0" />
                <span className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-light tracking-wide">
                  alex@example.com
                </span>
              </a>

              <a
                href="tel:+1234567890"
                className="flex items-center group hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300"
              >
                <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-4 flex-shrink-0" />
                <span className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-light tracking-wide">
                  +1 (234) 567-8900
                </span>
              </a>

              <a
                href="https://linkedin.com/in/alexjohnson"
                className="flex items-center group hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-4 flex-shrink-0" />
                <span className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-light tracking-wide">
                  linkedin.com/in/alexjohnson
                </span>
              </a>

              <a
                href="https://github.com/alexjohnson"
                className="flex items-center group hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300"
              >
                <Github className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-4 flex-shrink-0" />
                <span className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-light tracking-wide">
                  github.com/alexjohnson
                </span>
              </a>

              <a
                href="https://twitter.com/alexjohnson"
                className="flex items-center group hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-300"
              >
                <Twitter className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-4 flex-shrink-0" />
                <span className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-light tracking-wide">
                  @alexjohnson
                </span>
              </a>

              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-4 flex-shrink-0" />
                <span className="text-lg text-gray-700 dark:text-gray-300 font-light tracking-wide">
                  San Francisco, CA
                </span>
              </div>
            </div>
          </section>

          {/* Simple Connect Section */}
          <section className="text-center">
            <h2 className="text-3xl font-extralight text-gray-900 dark:text-gray-100 mb-8 tracking-wide">
              Let's <span className="text-amber-600 dark:text-amber-400">Collaborate</span>
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-light tracking-wide">
              I'm always interested in new opportunities and meaningful projects.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
