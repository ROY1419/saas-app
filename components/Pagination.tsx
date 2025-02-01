"use client"
import React from 'react'
import { Button } from './ui/button';

interface paginationProps {
    currentPage: number;
    totalPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPage,
    onPageChange
}: paginationProps) {
    return (
        <div className="flex justify-center space-x-2 mt-4">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
            >
                Previous
            </Button>
            <span className="flex items-center">
                Page {currentPage} of {totalPage}
            </span>
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPage}
                variant="outline"
            >
                Next
            </Button>
        </div>
    )
}
