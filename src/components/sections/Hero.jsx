import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Heading, Text } from '../ui/Typography';
import { Input, Select } from '../ui/Forms';

const Hero = () => {
  const levels = ["Class X Boards", "Class XII Boards", "College Prep", "Competitive Exams"];

  return (
    <header className="max-w-5xl mx-auto px-6 py-24 text-center">
      <Badge className="mb-6">The Zero-Tab-Switching Promise</Badge>
      
      <Heading level={1} className="mb-6">
        Stop managing resources. <br className="hidden md:block" />
        Start mastering concepts.
      </Heading>
      
      <Text variant="lead" className="mb-10 max-w-2xl mx-auto">
        An intelligent academic ecosystem that plans your syllabus, curates video lectures, adapts your practice, and resolves doubts instantly.
      </Text>
      
      {/* Search/Action Form */}
      <div className="bg-white border border-slate-200 p-2 rounded-lg max-w-2xl mx-auto flex flex-col md:flex-row shadow-sm">
        <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-200">
          <Select options={levels} />
        </div>
        <div className="flex-[2]">
          <Input placeholder="Target subject? (e.g., Physics, Java)" />
        </div>
        <Button variant="primary" className="w-full md:w-auto mt-2 md:mt-0 md:ml-2">
          Generate Path
        </Button>
      </div>
    </header>
  );
};

export default Hero;