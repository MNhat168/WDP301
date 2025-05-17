import { useState, useEffect } from 'react';
import Header from '../layout/header';
import { Link } from 'react-router-dom';
// import { FaFacebook, FaTwitter, FaLinkedin, FaBehance } from 'react-icons/fa';

const About = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading for preloader effect
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            {/* Preloader */}
            {isLoading && (
                <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
                    <div className="animate-bounce space-y-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                        <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                        <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                    </div>
                </div>
            )}

            <Header />

            {/* Hero Section */}
            <div 
                className="relative py-32 bg-cover bg-center text-white"
                style={{ backgroundImage: "url('/assets/images/heading-1-1920x500.jpg')" }}
            >
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center">
                        <h4 className="text-xl mb-2">about us</h4>
                        <h2 className="text-4xl font-semibold">our company</h2>
                    </div>
                </div>
            </div>

            {/* Best Features Section */}
            <div className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-semibold">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="rounded-lg overflow-hidden">
                            <img 
                                src="/assets/images/about-1-570x350.jpg" 
                                alt="About Us" 
                                className="w-full h-auto"
                            />
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-4">
                                Lorem ipsum dolor sit amet.
                            </h4>
                            <p className="text-gray-600 mb-6">
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed voluptate nihil eum consectetur similique? Consectetur, quod, incidunt, harum nisi dolores delectus reprehenderit voluptatem perferendis dicta dolorem non blanditiis ex fugiat.
                            </p>
                            <p className="text-gray-600 mb-6">
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et, consequuntur, modi mollitia corporis ipsa voluptate corrupti eum ratione ex ea praesentium quibusdam? Aut, in eum facere corrupti necessitatibus perspiciatis quis.
                            </p>
                            <div className="flex space-x-4">
                                <Link to="#" className="text-gray-600 hover:text-blue-600">
                                    {/* <FaFacebook size={24} /> */}
                                </Link>
                                <Link to="#" className="text-gray-600 hover:text-blue-400">
                                    {/* <FaTwitter size={24} /> */}
                                </Link>
                                <Link to="#" className="text-gray-600 hover:text-blue-700">
                                    {/* <FaLinkedin size={24} /> */}
                                </Link>
                                <Link to="#" className="text-gray-600 hover:text-blue-500">
                                    {/* <FaBehance size={24} /> */}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Members Section */}
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-semibold text-center mb-8">
                            Lorem ipsum dolor sit amet.
                        </h2>
                        <h5 className="text-xl mb-6">
                            Lorem ipsum dolor sit amet.
                        </h5>
                        <div className="space-y-6 text-gray-600">
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed voluptate nihil eum consectetur similique? Consectetur, quod, incidunt, harum nisi dolores delectus reprehenderit voluptatem perferendis dicta dolorem non blanditiis ex fugiat.
                            </p>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et, consequuntur, modi mollitia corporis ipsa voluptate corrupti eum ratione ex ea praesentium quibusdam? Aut, in eum facere corrupti necessitatibus perspiciatis quis.
                            </p>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo quae eveniet tempora reprehenderit quo, necessitatibus vel sit laboriosam, sunt obcaecati quisquam explicabo voluptatibus earum facilis quidem fuga maiores.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white py-6">
                <div className="container mx-auto px-4">
                    <div className="text-center text-gray-600">
                        <p>
                            Copyright © 2024 EasyJob - Template by:{' '}
                            <a 
                                href="https://www.phpjabbers.com/" 
                                className="text-blue-600 hover:text-blue-800"
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                PHPJabbers.com
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default About;