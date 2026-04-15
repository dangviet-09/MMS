import React from "react";
import { Blog } from "../../../api/blogApi";

type BlogContentProps = {
    blog: Blog;
};

export const BlogContent: React.FC<BlogContentProps> = ({ blog }) => {
    return (
        <>
            {blog.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{blog.title}</h3>
            )}
            <p className="text-gray-700 mb-4">{blog.content}</p>

            {/* Display images if available */}
            {blog.images && blog.images.length > 0 && (
                <div className="mb-4 w-full">
                    {/* 1 Image */}
                    {blog.images.length === 1 && (
                        <div className="relative w-full overflow-hidden rounded-lg">
                            <img
                                src={blog.images[0]}
                                alt="Blog image"
                                className="w-full h-auto max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => window.open(blog.images![0], '_blank')}
                            />
                            <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                +1
                            </div>
                        </div>
                    )}

                    {/* 2 Images */}
                    {blog.images.length === 2 && (
                        <div className="grid grid-cols-2 gap-2 w-full rounded-lg overflow-hidden">
                            {blog.images.map((img, idx) => (
                                <div key={idx} className="relative h-80 overflow-hidden">
                                    <img
                                        src={img}
                                        alt={`Blog image ${idx + 1}`}
                                        className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                        onClick={() => window.open(img, '_blank')}
                                    />
                                    <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        +{idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3 Images - Facebook/Instagram Style */}
                    {blog.images.length === 3 && (
                        <div className="grid grid-cols-2 gap-2 h-96 w-full rounded-lg overflow-hidden">
                            {/* Large image on left */}
                            <div className="relative col-span-1 h-full">
                                <img
                                    src={blog.images[0]}
                                    alt="Blog image 1"
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                    onClick={() => window.open(blog.images![0], '_blank')}
                                />
                                <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    +1
                                </div>
                            </div>
                            {/* Two small images stacked on right */}
                            <div className="col-span-1 grid grid-rows-2 gap-2 h-full">
                                {blog.images.slice(1).map((img, idx) => (
                                    <div key={idx} className="relative h-full">
                                        <img
                                            src={img}
                                            alt={`Blog image ${idx + 2}`}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                            onClick={() => window.open(img, '_blank')}
                                        />
                                        <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            +{idx + 2}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4 Images */}
                    {blog.images.length === 4 && (
                        <div className="grid grid-cols-2 gap-2 w-full rounded-lg overflow-hidden">
                            {blog.images.map((img, idx) => (
                                <div key={idx} className="relative h-60 overflow-hidden">
                                    <img
                                        src={img}
                                        alt={`Blog image ${idx + 1}`}
                                        className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                        onClick={() => window.open(img, '_blank')}
                                    />
                                    <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        +{idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 5+ Images */}
                    {blog.images.length >= 5 && (
                        <div className="grid grid-cols-2 gap-2 w-full rounded-lg overflow-hidden">
                            {blog.images.slice(0, 4).map((img, idx) => (
                                <div key={idx} className="relative h-60 overflow-hidden">
                                    <img
                                        src={img}
                                        alt={`Blog image ${idx + 1}`}
                                        className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                        onClick={() => window.open(img, '_blank')}
                                    />
                                    <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        +{idx + 1}
                                    </div>
                                    {idx === 3 && blog.images!.length > 4 && (
                                        <div
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(img, '_blank');
                                            }}
                                        >
                                            <span className="text-white text-4xl font-bold">+{blog.images!.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

