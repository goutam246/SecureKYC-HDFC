import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileCheck, Clock, Users, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Bank-grade security with full regulatory compliance for your peace of mind.',
  },
  {
    icon: FileCheck,
    title: 'Smart Document Scan',
    description: 'Advanced edge detection and quality checks ensure accurate document capture.',
  },
  {
    icon: Clock,
    title: 'Quick Verification',
    description: 'Complete your KYC in minutes with our streamlined digital process.',
  },
  {
    icon: Users,
    title: 'Face Match Technology',
    description: 'Real-time selfie verification ensures identity authenticity.',
  },
];

const steps = [
  { number: '01', title: 'Register', description: 'Create your account with email and mobile' },
  { number: '02', title: 'Upload Documents', description: 'Scan and upload Aadhaar, PAN & more' },
  { number: '03', title: 'Verify Identity', description: 'Take a live selfie for face match' },
  { number: '04', title: 'Get Verified', description: 'Receive instant KYC approval' },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="container relative py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                Complete Your KYC in{' '}
                <span className="text-accent">Minutes</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
                Digital identity verification made simple. Secure document scanning, real-time face match, and instant approval.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth?mode=register">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                    Start KYC Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                    Check Status
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary-foreground/5 rounded-3xl blur-xl" />
                <Card className="relative bg-card/95 backdrop-blur border-0 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Simulated KYC Progress */}
                      <div className="flex items-center gap-3 p-3 bg-success/10 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                          <p className="text-sm font-medium">Personal Details</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-success/10 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                          <p className="text-sm font-medium">Aadhaar Card</p>
                          <p className="text-xs text-muted-foreground">Verified</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-success/10 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                          <p className="text-sm font-medium">PAN Card</p>
                          <p className="text-xs text-muted-foreground">Verified</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl animate-pulse-soft">
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <div>
                          <p className="text-sm font-medium">Face Verification</p>
                          <p className="text-xs text-muted-foreground">In progress...</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose SecureKYC?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the most reliable and user-friendly digital KYC solution
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-elevated transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete your KYC in 4 simple steps
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <span className="font-display text-6xl font-bold text-primary/10">
                      {step.number}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/30" />
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/auth?mode=register">
              <Button size="lg" className="gap-2">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">SecureKYC</span>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
